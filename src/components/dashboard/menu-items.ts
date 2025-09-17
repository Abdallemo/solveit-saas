import {
  BookCheck,
  Bug,
  CalendarClockIcon,
  Home,
  LifeBuoy,
  LucideAlertTriangle,
  LucideBadgeDollarSign,
  LucideBarChart3,
  LucideBrain,
  LucideCalendar,
  LucideChartLine,
  LucideClipboardCheck,
  LucideClipboardList,
  LucideClipboardPlus,
  LucideDollarSign,
  LucideFileQuestion,
  LucideHandshake,
  LucideHistory,
  LucideIcon,
  LucideLayoutDashboard,
  LucideListChecks,
  LucideMessageSquare,
  LucideMonitor,
  LucidePackage,
  LucidePieChart,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
  LucideStar,
  LucideTrendingUp,
  LucideUserPlus,
  LucideUsers,
  PackageOpen,
  Send,
  SquareDashedMousePointerIcon,
  Users,
} from "lucide-react";
export type MenuItem = {
  type: "link" | "category";
  title: string;
  url: string;
  icon: LucideIcon;
  child?: MenuItem[];
};
export const MenuItemsModerator: MenuItem[] = [
  {
    type: "link",
    title: "Dashboard",
    url: "/dashboard/moderator",
    icon: LucideLayoutDashboard,
  },
  {
    type: "category",
    title: "Task Management",
    url: "",
    icon: BookCheck,
    child: [
      {
        type: "link",
        title: "Category Management",
        url: "/dashboard/moderator/categories",
        icon: LucideClipboardList,
      },
      {
        type: "link",
        title: "Deadline Management",
        url: "/dashboard/moderator/deadline",
        icon: CalendarClockIcon,
      },
    ],
  },
  {
    type: "category",
    title: "Dispute Management",
    url: "/dashboard/moderator/disputes",
    icon: LucideHandshake,
    child: [
      {
        type: "link",
        title: "All Disputes",
        url: "/dashboard/moderator/disputes",
        icon: LucideAlertTriangle,
      },
      {
        type: "link",
        title: "Pending Review",
        url: "/dashboard/moderator/disputes/pending",
        icon: LucideAlertTriangle,
      },
      {
        type: "link",
        title: "Resolved Cases",
        url: "/dashboard/moderator/disputes/resolved",
        icon: LucideClipboardCheck,
      },
    ],
  },
  {
    type: "category",
    title: "Content Review",
    url: "/dashboard/moderator/content",
    icon: LucideMonitor,
    child: [
      {
        type: "link",
        title: "Task Comments",
        url: "/dashboard/moderator/content/comments",
        icon: LucideMessageSquare,
      },
      {
        type: "link",
        title: "Mentor Messages",
        url: "/dashboard/moderator/content/mentor-messages",
        icon: LucideUsers,
      },
    ],
  },
  {
    type: "link",
    title: "Moderation Logs",
    url: "/dashboard/moderator/logs",
    icon: LucideHistory,
  },
  {
    type: "link",
    title: "Flagged Tasks",
    url: "/dashboard/moderator/flags",
    icon: LucideAlertTriangle,
  },
  {
    type: "link",
    title: "User Reports",
    url: "/dashboard/moderator/reports",
    icon: LucideFileQuestion,
  },
];

export const MenuItemsAdmin: MenuItem[] = [
  {
    type: "link",
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LucideLayoutDashboard,
  },
  {
    type: "category",
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: LucideUsers,
    child: [
      {
        type: "link",
        title: "Users",
        url: "/dashboard/admin/users",
        icon: Users,
      },
      {
        type: "link",
        title: "Moderators",
        url: "/dashboard/admin/users/moderators",
        icon: LucideShieldCheck,
      },
      {
        type: "link",
        title: "Pending Verifications",
        url: "/dashboard/admin/users/pending",
        icon: LucideAlertTriangle,
      },
    ],
  },
  {
    type: "category",
    title: "AI Management",
    url: "/dashboard/admin/ai",
    icon: LucideBrain,
    child: [
      {
        type: "link",
        title: "Rules",
        url: "/dashboard/admin/ai/",
        icon: LucideHistory,
      },
      {
        type: "link",
        title: "Moderation Logs",
        url: "/dashboard/admin/ai/logs",
        icon: LucideHistory,
      },
      {
        type: "link",
        title: "AI Feedback",
        url: "/dashboard/admin/ai/feedback",
        icon: LucideStar,
      },
    ],
  },
  {
    type: "link",
    title: "Subscription Management",
    url: "/dashboard/admin/subscriptions",
    icon: LucideBadgeDollarSign,
  },
  {
    type: "category",
    title: "Payment Management",
    url: "/dashboard/admin/payments",
    icon: LucideDollarSign,
    child: [
      {
        type: "link",
        title: "All Payments",
        url: "/dashboard/admin/payments",
        icon: LucideListChecks,
      },
      {
        type: "link",
        title: "Pending/Hold",
        url: "/dashboard/admin/payments/hold",
        icon: LucideListChecks,
      },
    ],
  },
  {
    type: "link",
    title: "System Reports",
    url: "/dashboard/admin/reports",
    icon: LucidePieChart,
  },
  {
    type: "link",
    title: "Site Settings",
    url: "/dashboard/admin/settings",
    icon: LucideSettings,
  },
];

export const MenuItemsPoster: MenuItem[] = [
  {
    type: "link",
    title: "Dashboard",
    url: "/dashboard/poster",
    icon: Home,
  },
  {
    type: "category",
    title: "Tasks & Jobs",
    url: "/dashboard/tasks",
    icon: LucidePackage,
    child: [
      {
        type: "link",
        title: "Browse Public Tasks",
        url: "/dashboard/poster/tasks",
        icon: SquareDashedMousePointerIcon,
      },
      {
        type: "link",
        title: "New Task/Job",
        url: "/dashboard/poster/newTask",
        icon: LucideClipboardPlus,
      },
      {
        type: "link",
        title: "Your Tasks/Jobs",
        url: "/dashboard/poster/yourTasks",
        icon: LucideListChecks,
      },
      {
        type: "link",
        title: "Disputes / Support",
        url: "/dashboard/poster/disputes",
        icon: LucideFileQuestion,
      },
      {
        type: "link",
        title: "Task Analytics",
        url: "/dashboard/poster/task-analytics",
        icon: LucideBarChart3,
      },
    ],
  },
  {
    type: "category",
    title: "Mentorship",
    url: "/dashboard/poster/#",
    icon: LucideUsers,
    child: [
      {
        type: "link",
        title: "Browse Mentors",
        url: "/dashboard/poster/bookings",
        icon: LucideSearch,
      },
      {
        type: "link",
        title: "Booked Sessions",
        url: "/dashboard/poster/sessions",
        icon: LucideCalendar,
      },
      {
        type: "link",
        title: "Past Sessions",
        url: "/dashboard/poster/history",
        icon: LucideHistory,
      },
      {
        type: "link",
        title: "Workspace",
        url: "/dashboard/poster/workspace",
        icon: LucideMonitor,
      },
    ],
  },
];

export const MenuItemsSolver: MenuItem[] = [
  {
    type: "link",
    title: "Dashboard",
    url: "/dashboard/solver",
    icon: Home,
  },
  {
    type: "category",
    title: "Browse Tasks ",
    url: "/dashboard/tasks",
    icon: Bug,
    child: [
      {
        type: "link",
        title: "Browse Available Tasks",
        url: "/dashboard/solver/tasks",
        icon: PackageOpen,
      },
      {
        type: "link",
        title: "Assigned Tasks",
        url: "/dashboard/solver/assignedTasks",
        icon: LucideClipboardCheck,
      },
      {
        type: "link",
        title: "Disputes / Support",
        url: "/dashboard/solver/disputes",
        icon: LucideFileQuestion,
      },

      {
        type: "link",
        title: "Earnings",
        url: "/dashboard/solver/earnings",
        icon: LucideDollarSign,
      },
    ],
  },
  {
    type: "category",
    title: "Mentorship",
    url: "/dashboard/solver/mentor",
    icon: LucideUsers,
    child: [
      {
        type: "link",

        title: "Sessions",
        url: "/dashboard/solver/mentor",
        icon: LucideUserPlus,
      },
      {
        type: "link",

        title: "Mentor Listing",
        url: "/dashboard/solver/listing",
        icon: LucideUserPlus,
      },
      {
        type: "link",

        title: "My Reviews",
        url: "/dashboard/solver/reviews",
        icon: LucideStar,
      },
    ],
  },
  {
    type: "category",
    title: "Reputation & Reports",
    url: "/dashboard/solver/reputation",
    icon: LucideChartLine,
    child: [
      {
        type: "link",
        title: "My Reputation",
        url: "/dashboard/solver/reputation",
        icon: LucideTrendingUp,
      },
      {
        type: "link",
        title: "My Analytics",
        url: "/dashboard/solver/analysis",
        icon: LucideBarChart3,
      },
    ],
  },
];

export const navSecondary = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  },
];
