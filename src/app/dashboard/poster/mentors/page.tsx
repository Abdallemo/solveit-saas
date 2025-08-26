import { MentorsBrowser } from "@/features/mentore/components/BrowseMentor"

const mockMentors = [
  {
    id: "1",
    userId: "user-1",
    displayName: "Sarah Johnson",
    avatar: "/avatars/avatar-1.svg",
    title: "Senior Frontend Developer",
    description:
      "Experienced React and TypeScript developer with 8+ years in the industry. I specialize in helping developers master modern frontend technologies and best practices.",
    ratePerHour: 75,
    availableTimes: [
      { day: "Monday", start: "09:00", end: "17:00" },
      { day: "Wednesday", start: "09:00", end: "17:00" },
      { day: "Friday", start: "09:00", end: "17:00" },
    ],
    isPublished: true,
  },
  {
    id: "2",
    userId: "user-2",
    displayName: "Michael Chen",
    avatar: "/avatars/avatar-2.svg",
    title: "Full Stack Engineer",
    description:
      "Full-stack developer with expertise in Node.js, Python, and cloud architecture. I love mentoring junior developers and helping them grow their careers.",
    ratePerHour: 85,
    availableTimes: [
      { day: "Tuesday", start: "10:00", end: "18:00" },
      { day: "Thursday", start: "10:00", end: "18:00" },
    ],
    isPublished: true,
  },
  {
    id: "3",
    userId: "user-3",
    displayName: "Emily Rodriguez",
    avatar: "/avatars/avatar-3.svg",
    title: "UX/UI Designer",
    description:
      "Creative designer with a passion for user-centered design. I help developers understand design principles and create better user experiences.",
    ratePerHour: 65,
    availableTimes: [
      { day: "Monday", start: "14:00", end: "20:00" },
      { day: "Wednesday", start: "14:00", end: "20:00" },
      { day: "Saturday", start: "09:00", end: "15:00" },
    ],
    isPublished: true,
  },
  {
    id: "4",
    userId: "user-3",
    displayName: "Emily Rodriguez",
    avatar: "/avatars/avatar-3.svg",
    title: "UX/UI Designer",
    description:
      "Creative designer with a passion for user-centered design. I help developers understand design principles and create better user experiences.",
    ratePerHour: 65,
    availableTimes: [
      { day: "Monday", start: "14:00", end: "20:00" },
      { day: "Wednesday", start: "14:00", end: "20:00" },
      { day: "Saturday", start: "09:00", end: "15:00" },
    ],
    isPublished: true,
  },
  {
    id: "5",
    userId: "user-3",
    displayName: "Emily Rodriguez",
    avatar: "/avatars/avatar-3.svg",
    title: "UX/UI Designer",
    description:
      "Creative designer with a passion for user-centered design. I help developers understand design principles and create better user experiences.",
    ratePerHour: 65,
    availableTimes: [
      { day: "Monday", start: "14:00", end: "20:00" },
      { day: "Wednesday", start: "14:00", end: "20:00" },
      { day: "Saturday", start: "09:00", end: "15:00" },
    ],
    isPublished: true,
  },
  {
    id: "6",
    userId: "user-3",
    displayName: "Emily Rodriguez",
    avatar: "/avatars/avatar-3.svg",
    title: "UX/UI Designer",
    description:
      "Creative designer with a passion for user-centered design. I help developers understand design principles and create better user experiences.",
    ratePerHour: 65,
    availableTimes: [
      { day: "Monday", start: "14:00", end: "20:00" },
      { day: "Wednesday", start: "14:00", end: "20:00" },
      { day: "Saturday", start: "09:00", end: "15:00" },
    ],
    isPublished: true,
  },
  {
    id: "7",
    userId: "user-3",
    displayName: "Emily Rodriguez",
    avatar: "/avatars/avatar-3.svg",
    title: "UX/UI Designer",
    description:
      "Creative designer with a passion for user-centered design. I help developers understand design principles and create better user experiences.",
    ratePerHour: 65,
    availableTimes: [
      { day: "Monday", start: "14:00", end: "20:00" },
      { day: "Wednesday", start: "14:00", end: "20:00" },
      { day: "Saturday", start: "09:00", end: "15:00" },
    ],
    isPublished: true,
  },
]

export default function MentorsPage() {
  

  return (
    <div className="container mx-auto px-4 py-8">
      <MentorsBrowser mentors={mockMentors}  />
    </div>
  )
}
