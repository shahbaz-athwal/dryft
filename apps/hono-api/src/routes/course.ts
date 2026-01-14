import { os } from "@orpc/server";
import { z } from "zod";
import { Prisma } from "../../prisma/generated/client";
import { db } from "../services/db";

const courseFiltersSchema = z.object({
  search: z.string().optional(),
  professorIds: z.array(z.string()).optional(),
  termCodes: z.array(z.string()).optional(),
  timeRange: z
    .object({
      start: z.string(), // HH:mm format
      end: z.string(),
    })
    .optional(),
  departmentPrefixes: z.array(z.string()).optional(),
  academicLevels: z.array(z.number().int().min(1).max(9)).optional(),
});

const courseSortSchema = z.object({
  field: z.enum(["academicLevel", "title", "difficulty", "ratingCount"]),
  direction: z.enum(["asc", "desc"]),
});

const coursePaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

const courseQueryInputSchema = z.object({
  filters: courseFiltersSchema.optional(),
  sort: courseSortSchema.optional(),
  pagination: coursePaginationSchema.default({ limit: 20 }),
});

// Regex for extracting academic level from course code (e.g., COMP2395 -> 2)
const ACADEMIC_LEVEL_REGEX = /[A-Z]+(\d)/;

/**
 * Extract academic level from course code (e.g., COMP2395 -> 2, MATH1000 -> 1)
 */
function extractAcademicLevel(code: string): number {
  const match = code.match(ACADEMIC_LEVEL_REGEX);
  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

type CourseFilters = z.infer<typeof courseFiltersSchema>;

/**
 * Build Prisma WHERE conditions from filters
 */
function buildCourseWhereConditions(
  filters: CourseFilters | undefined
): Prisma.CourseWhereInput {
  const conditions: Prisma.CourseWhereInput[] = [];

  if (filters?.search) {
    conditions.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters?.departmentPrefixes?.length) {
    conditions.push({
      departmentPrefix: { in: filters.departmentPrefixes },
    });
  }

  if (filters?.professorIds?.length) {
    conditions.push({
      professors: {
        some: { professorId: { in: filters.professorIds } },
      },
    });
  }

  if (filters?.termCodes?.length) {
    conditions.push({
      sections: {
        some: { termCode: { in: filters.termCodes } },
      },
    });
  }

  if (filters?.timeRange) {
    conditions.push({
      sections: {
        some: {
          classStartTime: { gte: filters.timeRange.start },
          classEndTime: { lte: filters.timeRange.end },
        },
      },
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/**
 * Map course data to response format with computed fields
 */
function mapCourseToResponse(course: {
  id: string;
  code: string;
  title: string;
  description: string;
  departmentPrefix: string;
  credits: number;
  avgDifficulty: number | null;
  ratingCount: number;
}) {
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    description: course.description,
    departmentPrefix: course.departmentPrefix,
    credits: course.credits,
    _computed: {
      academicLevel: extractAcademicLevel(course.code),
      avgDifficulty: course.avgDifficulty,
      ratingCount: course.ratingCount,
    },
  };
}

type RawCourseWithAggregates = {
  id: string;
  code: string;
  title: string;
  description: string;
  departmentPrefix: string;
  credits: number;
  avgDifficulty: number | null;
  ratingCount: bigint;
};

/**
 * Query courses with aggregate-based sorting (difficulty or ratingCount)
 */
function queryCoursesWithAggregates(
  filters: CourseFilters | undefined,
  sort: { field: string; direction: string },
  limit: number,
  cursor: string | undefined
): Promise<RawCourseWithAggregates[]> {
  const direction = sort.direction === "desc" ? "DESC" : "ASC";
  const sortField = sort.field;

  return db.$queryRaw<RawCourseWithAggregates[]>`
    SELECT 
      c.id,
      c.code,
      c.title,
      c.description,
      c."departmentPrefix",
      c.credits,
      AVG(r.difficulty)::float as "avgDifficulty",
      COUNT(r.id) as "ratingCount"
    FROM course c
    LEFT JOIN rating r ON r."courseId" = c.id
    ${filters?.search ? Prisma.sql`WHERE (c.title ILIKE ${`%${filters.search}%`} OR c.code ILIKE ${`%${filters.search}%`})` : Prisma.empty}
    ${filters?.departmentPrefixes?.length ? Prisma.sql`${filters?.search ? Prisma.sql`AND` : Prisma.sql`WHERE`} c."departmentPrefix" IN (${Prisma.join(filters.departmentPrefixes)})` : Prisma.empty}
    GROUP BY c.id
    ORDER BY ${sortField === "difficulty" ? Prisma.sql`"avgDifficulty"` : Prisma.sql`"ratingCount"`} ${direction === "DESC" ? Prisma.sql`DESC NULLS LAST` : Prisma.sql`ASC NULLS FIRST`}
    LIMIT ${limit + 1}
    ${cursor ? Prisma.sql`OFFSET ${Number.parseInt(cursor, 10)}` : Prisma.empty}
  `;
}

/**
 * Apply academic level filter and pagination to courses
 */
function applyAcademicLevelFilterAndPaginate<T extends { code: string }>(
  courses: T[],
  academicLevels: number[] | undefined,
  limit: number
): { results: T[]; hasMore: boolean } {
  let filtered = courses;
  if (academicLevels?.length) {
    filtered = courses.filter((c) =>
      academicLevels.includes(extractAcademicLevel(c.code))
    );
  }
  const hasMore = filtered.length > limit;
  return {
    results: hasMore ? filtered.slice(0, limit) : filtered,
    hasMore,
  };
}

/**
 * Calculate next cursor for pagination
 */
function calculateNextCursor(
  hasMore: boolean,
  currentCursor: string | undefined,
  limit: number
): string | null {
  if (!hasMore) {
    return null;
  }
  const offset = currentCursor ? Number.parseInt(currentCursor, 10) : 0;
  return String(offset + limit);
}

export const queryCourses = os
  .input(courseQueryInputSchema)
  .handler(async ({ input }) => {
    const { filters, sort, pagination } = input;
    const { cursor, limit } = pagination;
    const where = buildCourseWhereConditions(filters);
    const academicLevelFilter = filters?.academicLevels;

    // Aggregate-based sorting requires raw SQL
    const needsAggregation =
      sort?.field === "difficulty" || sort?.field === "ratingCount";

    if (needsAggregation && sort) {
      const rawCourses = await queryCoursesWithAggregates(
        filters,
        sort,
        limit,
        cursor
      );

      const aggregateResult = applyAcademicLevelFilterAndPaginate(
        rawCourses,
        academicLevelFilter,
        limit
      );

      const totalCount = await db.course.count({ where });

      return {
        courses: aggregateResult.results.map((c) =>
          mapCourseToResponse({ ...c, ratingCount: Number(c.ratingCount) })
        ),
        nextCursor: calculateNextCursor(aggregateResult.hasMore, cursor, limit),
        totalCount,
      };
    }

    // Standard Prisma query for non-aggregate sorting
    let orderBy: Prisma.CourseOrderByWithRelationInput = { title: "asc" };
    if (sort?.field === "title") {
      orderBy = { title: sort.direction };
    } else if (sort?.field === "academicLevel") {
      orderBy = { code: sort.direction };
    }

    const prismaCourses = await db.course.findMany({
      where,
      orderBy,
      take: limit + 1,
      skip: cursor ? Number.parseInt(cursor, 10) : 0,
      include: {
        _count: { select: { ratings: true } },
        ratings: { select: { difficulty: true } },
      },
    });

    const prismaResult = applyAcademicLevelFilterAndPaginate(
      prismaCourses,
      academicLevelFilter,
      limit
    );

    const totalCount = await db.course.count({ where });

    return {
      courses: prismaResult.results.map((c) => {
        const avgDifficulty =
          c.ratings.length > 0
            ? c.ratings.reduce((sum, r) => sum + r.difficulty, 0) /
              c.ratings.length
            : null;
        return mapCourseToResponse({
          ...c,
          avgDifficulty,
          ratingCount: c._count.ratings,
        });
      }),
      nextCursor: calculateNextCursor(prismaResult.hasMore, cursor, limit),
      totalCount,
    };
  });

const courseByIdInputSchema = z.object({
  code: z.string().min(1),
});

export const courseById = os
  .input(courseByIdInputSchema)
  .errors({
    NOT_FOUND: {
      message: "Course not found",
    },
  })
  .handler(async ({ input, errors }) => {
    const course = await db.course.findUnique({
      where: { code: input.code },
      include: {
        department: true,
        sections: {
          include: {
            term: true,
            professor: true,
          },
          orderBy: [
            { termCode: "desc" },
            { sectionCode: "asc" },
            { classStartTime: "asc" },
          ],
        },
        professors: {
          include: {
            professor: true,
          },
        },
        ratings: {
          where: { status: "APPROVED" },
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
            _count: {
              select: { flags: true },
            },
          },
          orderBy: { postedAt: "desc" },
        },
        files: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      throw errors.NOT_FOUND({
        message: `Course with code "${input.code}" not found`,
      });
    }

    // Group sections by term
    const sectionsByTermMap = new Map<
      string,
      {
        term: {
          code: string;
          name: string;
          isActive: boolean;
          startDate: Date;
          endDate: Date;
        };
        sections: typeof course.sections;
      }
    >();

    for (const section of course.sections) {
      const termCode = section.termCode;
      if (!sectionsByTermMap.has(termCode)) {
        sectionsByTermMap.set(termCode, {
          term: section.term,
          sections: [],
        });
      }
      const termGroup = sectionsByTermMap.get(termCode);
      if (termGroup) {
        termGroup.sections.push(section);
      }
    }

    // Convert to array and sort: active terms first, then by startDate desc
    const sectionsByTerm = Array.from(sectionsByTermMap.values()).sort(
      (a, b) => {
        if (a.term.isActive !== b.term.isActive) {
          return a.term.isActive ? -1 : 1;
        }
        return b.term.startDate.getTime() - a.term.startDate.getTime();
      }
    );

    // Extract professors with optional section counts
    const professors = course.professors.map((cp) => {
      const sectionCount = course.sections.filter(
        (s) => s.professorId === cp.professor.id
      ).length;
      return {
        id: cp.professor.id,
        name: cp.professor.name,
        designation: cp.professor.designation,
        imageUrl: cp.professor.imageUrl,
        departmentPrefix: cp.professor.departmentPrefix,
        sectionCountForCourse: sectionCount,
      };
    });

    // Compute aggregates from approved ratings
    const approvedRatings = course.ratings;
    const totalRatings = approvedRatings.length;
    const avgDifficulty =
      totalRatings > 0
        ? approvedRatings.reduce((sum, r) => sum + r.difficulty, 0) /
          totalRatings
        : null;
    const avgQuality =
      totalRatings > 0
        ? approvedRatings.reduce((sum, r) => sum + r.quality, 0) / totalRatings
        : null;

    return {
      metadata: {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        credits: course.credits,
        departmentPrefix: course.departmentPrefix,
        departmentName: course.department.name,
        requisites: course.requisites,
        lastSectionPulledAt: course.lastSectionPulledAt,
      },
      sectionsByTerm,
      professors,
      ratings: approvedRatings.map((r) => ({
        id: r.id,
        professorId: r.professorId,
        professorName: r.professor.name,
        professorImageUrl: r.professor.imageUrl,
        quality: r.quality,
        difficulty: r.difficulty,
        comment: r.comment,
        postedAt: r.postedAt,
        tags: r.tags,
        wouldTakeAgain: r.wouldTakeAgain,
        isForCredit: r.isForCredit,
        textBookRequired: r.textBookRequired,
        attendanceRequired: r.attendanceRequired,
        gradeReceived: r.gradeReceived,
        thumbsUpTotal: r.thumbsUpTotal,
        thumbsDownTotal: r.thumbsDownTotal,
        flagCount: r._count.flags,
      })),
      files: course.files.map((f) => ({
        id: f.id,
        name: f.name,
        key: f.key,
        mimeType: f.mimeType,
        size: f.size,
        createdAt: f.createdAt,
        userId: f.userId,
      })),
      _aggregates: {
        totalRatings,
        avgDifficulty,
        avgQuality,
      },
    };
  });
