import { z } from "zod";

export const SectionDetailsFilteredResponseSchema = z
  .object({
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
  })
  .transform((data) =>
    data.SectionsRetrieved.TermsAndSections.map((termData) => ({
      code: termData.Term.Code,
      description: termData.Term.Description,
      startDate: termData.Term.StartDate,
      endDate: termData.Term.EndDate,
      reportingTerm: termData.Term.ReportingTerm,

      sections: termData.Sections.map((sectionData) => ({
        id: sectionData.Section.Id,
        courseName: sectionData.Section.CourseName,

        enrollment: {
          available: sectionData.Section.Available,
          capacity: sectionData.Section.Capacity,
          enrolled: sectionData.Section.Enrolled,
          waitlisted: sectionData.Section.Waitlisted,
        },

        meetingTimes: sectionData.Section.FormattedMeetingTimes.map(
          (meeting) => ({
            daysOfWeek: meeting.DaysOfWeekDisplay,
            startTime: meeting.StartTimeDisplay,
            endTime: meeting.EndTimeDisplay,
            building: meeting.BuildingDisplay,
            room: meeting.RoomDisplay,
            roomCode: meeting.Room,
            showTBD: meeting.ShowTBD,
            days: meeting.Days,
          })
        ),

        instructors: sectionData.InstructorDetails.map((instructor) => ({
          id: instructor.FacultyId,
          name: instructor.FacultyName,
        })),
      })),
    }))
  );

export type SectionDetailsTransformed = z.infer<
  typeof SectionDetailsFilteredResponseSchema
>;
