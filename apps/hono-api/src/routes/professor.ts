import { os } from "@orpc/server";
import { z } from "zod";
import { db } from "../services/db";

const professorByIdInputSchema = z.object({
  id: z.string().min(1),
});

export const professorById = os
  .input(professorByIdInputSchema)
  .errors({
    NOT_FOUND: {
      message: "Professor not found",
    },
  })
  .handler(async ({ input, errors }) => {
    const professor = await db.professor.findUnique({
      where: { id: input.id },
      include: {
        department: true,
        courses: {
          include: {
            course: true,
          },
        },
        sections: {
          include: {
            term: true,
            course: true,
          },
          orderBy: [
            { termCode: "desc" },
            { sectionCode: "asc" },
            { classStartTime: "asc" },
          ],
        },
        ratings: {
          where: { status: "APPROVED" },
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true,
                departmentPrefix: true,
                credits: true,
                description: true,
              },
            },
            _count: {
              select: { flags: true },
            },
          },
          orderBy: { postedAt: "desc" },
        },
      },
    });

    if (!professor) {
      throw errors.NOT_FOUND({
        message: `Professor with id "${input.id}" not found`,
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
        sections: typeof professor.sections;
      }
    >();

    for (const section of professor.sections) {
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

    // Extract courses
    const courses = professor.courses.map((cp) => ({
      id: cp.course.id,
      code: cp.course.code,
      title: cp.course.title,
      departmentPrefix: cp.course.departmentPrefix,
      credits: cp.course.credits,
      description: cp.course.description,
    }));

    // Compute similar professors
    const courseIds = courses.map((c) => c.id);
    const courseProfessors = await db.courseProfessor.findMany({
      where: {
        courseId: { in: courseIds },
        professorId: { not: input.id },
      },
      include: {
        professor: {
          include: {
            department: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    // Group by professorId and accumulate shared courses
    const similarProfessorsMap = new Map<
      string,
      {
        professor: (typeof courseProfessors)[0]["professor"];
        sharedCourses: Array<{
          id: string;
          code: string;
          title: string;
        }>;
        sharedCourseCount: number;
      }
    >();

    for (const cp of courseProfessors) {
      const profId = cp.professorId;
      if (!similarProfessorsMap.has(profId)) {
        similarProfessorsMap.set(profId, {
          professor: cp.professor,
          sharedCourses: [],
          sharedCourseCount: 0,
        });
      }
      const entry = similarProfessorsMap.get(profId);
      if (entry) {
        entry.sharedCourses.push(cp.course);
        entry.sharedCourseCount += 1;
      }
    }

    // Sort by sharedCourseCount desc and take top 10
    const similarProfessors = Array.from(similarProfessorsMap.values())
      .sort((a, b) => b.sharedCourseCount - a.sharedCourseCount)
      .slice(0, 10)
      .map((entry) => ({
        id: entry.professor.id,
        name: entry.professor.name,
        designation: entry.professor.designation,
        imageUrl: entry.professor.imageUrl,
        departmentPrefix: entry.professor.departmentPrefix,
        sharedCourseCount: entry.sharedCourseCount,
        sharedCourses: entry.sharedCourses,
      }));

    return {
      metadata: {
        id: professor.id,
        rmpId: professor.rmpId,
        name: professor.name,
        designation: professor.designation,
        officeLocation: professor.officeLocation,
        email: professor.email,
        phone: professor.phone,
        linkedinUrl: professor.linkedinUrl,
        websiteUrl: professor.websiteUrl,
        imageUrl: professor.imageUrl,
        lastPullFromRmp: professor.lastPullFromRmp,
        departmentPrefix: professor.departmentPrefix,
        departmentName: professor.department.name,
      },
      courses,
      sectionsByTerm,
      ratings: professor.ratings.map((r) => ({
        id: r.id,
        courseId: r.courseId,
        courseCode: r.course.code,
        courseTitle: r.course.title,
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
      similarProfessors,
    };
  });
