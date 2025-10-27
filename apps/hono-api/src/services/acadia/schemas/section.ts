import { z } from "zod";

export const SectionDetailsFilteredResponseSchema = z.object({
  SectionsRetrieved: z.object({
    TermsAndSections: z.array(
      z.object({
        Term: z.object({
          Code: z.string(),
          Description: z.string(),
          StartDate: z.string(),
          EndDate: z.string(),
          ReportingTerm: z.string(),
        }),
        Sections: z.array(
          z.object({
            Section: z.object({
              FormattedMeetingTimes: z.array(
                z.object({
                  DaysOfWeekDisplay: z.string(),
                  StartTimeDisplay: z.string(),
                  EndTimeDisplay: z.string(),
                  BuildingDisplay: z.string(),
                  RoomDisplay: z.string(),
                  ShowTBD: z.boolean(),
                  Days: z.array(z.number()),
                  Room: z.string(),
                })
              ),
              Id: z.string(),
              Available: z.number(),
              Capacity: z.number(),
              Enrolled: z.number(),
              Waitlisted: z.number(),
              CourseName: z.string(),
            }),
            InstructorDetails: z.array(
              z.object({
                FacultyId: z.string(),
                FacultyName: z.string(),
              })
            ),
          })
        ),
      })
    ),
  }),
});
