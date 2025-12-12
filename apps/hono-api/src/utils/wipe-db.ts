import { db } from "../services/db";

/**
 * ⚠️ DANGEROUS: Wipes all data from the database.
 * Deletes in order to respect foreign key constraints.
 */
export async function wipeDb() {
  // Delete in order: children first, then parents
  await db.$transaction([
    // Auth-related (Session & Account depend on User)
    db.session.deleteMany(),
    db.account.deleteMany(),
    db.user.deleteMany(),

    // Course-related (Section depends on Term, Course, Professor)
    db.section.deleteMany(),
    db.courseProfessor.deleteMany(),
    db.course.deleteMany(),
    db.professor.deleteMany(),

    // Parent tables
    db.department.deleteMany(),

    // Standalone tables
    db.verification.deleteMany(),
  ]);
}
