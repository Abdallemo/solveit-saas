import {
  Home,
  Bug,
  Send,
  LifeBuoy,
  LucideBarChart3,
  LucidePieChart,
  LucideAlertTriangle,
  LucideClipboardList,
  LucideHistory,
  LucideUsers,
  LucideMonitor,
  LucideBrain,
  LucideSearch,
  LucideSettings,
  LucideStar,
  LucideShieldCheck,
  LucideDollarSign,
  LucideBadgeDollarSign,
  LucideListChecks,
  LucideLayoutDashboard,
  LucideCalendar,
  LucideClipboardCheck,
  LucideClipboardPlus,
  LucideUserPlus,
  LucideMessageCircle, // Replaced placeholder
  LucidePencil, // Replaced placeholder
  LucideFileQuestion, // Replaced placeholder
  LucideTrendingUp, // Replaced placeholder
  LucideHandshake, // Replaced placeholder
  LucidePackage, // Replaced placeholder
  LucideMessageSquare, // Replaced placeholder
  LucideHandCoins, // Replaced placeholder
  LucideChartLine, // Replaced placeholder
  LucideListTodo, // Replaced placeholder
} from "lucide-react";

export const MenuItemsModerator = [
  {
    title: "Dashboard",
    url: "/dashboard/moderator",
    icon: LucideLayoutDashboard,
  },
  {
    title: "Category Management",
    url: "/dashboard/moderator/categories",
    icon: LucideClipboardList,
  },
  {
    title: "Dispute Management",
    url: "/dashboard/moderator/disputes",
    icon: LucideHandshake,
    child: [
      {
        title: "Pending Review",
        url: "/dashboard/moderator/disputes/pending",
        icon: LucideAlertTriangle,
      },
      {
        title: "Resolved Cases",
        url: "/dashboard/moderator/disputes/resolved",
        icon: LucideClipboardCheck,
      },
    ],
  },
  {
    title: "Content Review",
    url: "/dashboard/moderator/content",
    icon: LucideMonitor,
    child: [
      {
        title: "Task Comments",
        url: "/dashboard/moderator/content/comments",
        icon: LucideMessageSquare,
      },
      {
        title: "Mentor Messages",
        url: "/dashboard/moderator/content/mentor-messages",
        icon: LucideUsers,
      },
    ],
  },
  {
    title: "Moderation Logs",
    url: "/dashboard/moderator/logs",
    icon: LucideHistory,
  },
  {
    title: "Flagged Tasks",
    url: "/dashboard/moderator/flags",
    icon: LucideAlertTriangle,
  },
  {
    title: "User Reports",
    url: "/dashboard/moderator/reports",
    icon: LucideFileQuestion,
  },
];

export const MenuItemsAdmin = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LucideLayoutDashboard,
  },
  {
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: LucideUsers,
    child: [
      {
        title: "Moderators",
        url: "/dashboard/admin/users/moderators",
        icon: LucideShieldCheck,
      },
      {
        title: "Pending Verifications",
        url: "/dashboard/admin/users/pending",
        icon: LucideAlertTriangle,
      },
    ],
  },
  {
    title: "AI Management",
    url: "/dashboard/admin/ai",
    icon: LucideBrain,
    child: [
      {
        title: "Moderation Logs",
        url: "/dashboard/admin/ai/logs",
        icon: LucideHistory,
      },
      {
        title: "AI Feedback",
        url: "/dashboard/admin/ai/feedback",
        icon: LucideStar,
      },
    ],
  },
  {
    title: "Subscription Management",
    url: "/dashboard/admin/subscriptions",
    icon: LucideBadgeDollarSign,
  },
  {
    title: "Payment Management",
    url: "/dashboard/admin/payments",
    icon: LucideDollarSign,
    child: [
      {
        title: "Pending/Hold",
        url: "/dashboard/admin/payments/hold",
        icon: LucideListChecks,
      },
    ],
  },
  {
    title: "System Reports",
    url: "/dashboard/admin/reports",
    icon: LucidePieChart,
  },
  {
    title: "Site Settings",
    url: "/dashboard/admin/settings",
    icon: LucideSettings,
  },
];

export const MenuItemsPoster = [
  {
    title: "Dashboard",
    url: "/dashboard/poster",
    icon: Home,
  },
  {
    title: "Tasks & Jobs",
    url: "/dashboard/tasks",
    icon: LucidePackage,
    child: [
      {
        title: "New Task/Job",
        url: "/dashboard/poster/newTask",
        icon: LucideClipboardPlus,
      },
      {
        title: "Your Tasks/Jobs",
        url: "/dashboard/poster/yourTasks",
        icon: LucideListChecks,
      },
      {
        title: "Task Analytics",
        url: "/dashboard/poster/task-analytics",
        icon: LucideBarChart3,
      },
    ],
  },
  {
    title: "Mentorship",
    url: "/dashboard/poster/#",
    icon: LucideUsers,
    child: [
      {
        title: "Browse Mentors",
        url: "/dashboard/poster/mentors",
        icon: LucideSearch,
      },
      {
        title: "Bookings",
        url: "/dashboard/poster/bookings",
        icon: LucideCalendar,
      },
      {
        title: "Past Sessions",
        url: "/dashboard/poster/history",
        icon: LucideHistory,
      },
      {
        title: "Workspace",
        url: "/dashboard/poster/workspace",
        icon: LucideMonitor,
      },
    ],
  },
];

export const MenuItemsSolver = [
  {
    title: "Dashboard",
    url: "/dashboard/solver",
    icon: Home,
  },
  {
    title: "Browse Tasks ",
    url: "/dashboard/tasks",
    icon: Bug,
    child: [
      {
        title: "Assigned Tasks",
        url: "/dashboard/solver/assignedTasks",
        icon: LucideClipboardCheck,
      },
      {
        title: "Disputes / Support",
        url: "/dashboard/solver/disputes",
        icon: LucideFileQuestion,
      },
      {
        title: "Earnings",
        url: "/dashboard/solver/earnings",
        icon: LucideDollarSign,
      },
    ],
  },
  {
    title: "Mentorship",
    url: "/dashboard/solver/mentor",
    icon: LucideUsers,
    child: [
      {
        title: "Mentor Listing",
        url: "/dashboard/solver/listing",
        icon: LucideUserPlus,
      },
      {
        title: "My Reviews",
        url: "/dashboard/solver/reviews",
        icon: LucideStar,
      },
    ],
  },
  {
    title: "Reputation & Reports",
    url: "/dashboard/solver/reputation",
    icon: LucideChartLine,
    child: [
      {
        title: "My Reputation",
        url: "/dashboard/solver/listing",
        icon: LucideTrendingUp,
      },
      {
        title: "My Analytics",
        url: "/dashboard/solver/reviews",
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