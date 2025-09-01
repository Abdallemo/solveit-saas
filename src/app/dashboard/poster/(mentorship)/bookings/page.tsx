import { MentorsBrowser } from "@/features/mentore/components/BrowseMentor"
import {  getMentorListigWithAvailbelDates, MentorListType } from "@/features/mentore/server/action"

export  default async function MentorsPage() {
  const mentorWithj = await getMentorListigWithAvailbelDates()

  return (
    <div className="container mx-auto px-4 py-8">
      <MentorsBrowser mentors={mentorWithj}  />
    </div>
  )
}
