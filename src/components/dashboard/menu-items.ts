import {
  Home,
  Bug,
  Send,
  LifeBuoy,
  LucideBarChart3,
  LucidePieChart,
  LucideAlertTriangle,
} from "lucide-react";
import {
  LuArrowUpRight,
  LuBadgeDollarSign,
  LuBrain,
  LuCalendar,
  LuClipboardCheck,
  LuClipboardList,
  LuClipboardPlus,
  LuDollarSign,
  LuHistory,
  LuLayoutDashboard,
  LuListChecks,
  LuMonitor,
  LuSearch,
  LuSettings,
  LuShieldCheck,
  LuStar,
  LuUserPlus,
  LuUsers,
} from "react-icons/lu";
export const MenuItemsModerator = [
  {
    title: "Dashboard",
    url: "/dashboard/moderator",
    icon: LuLayoutDashboard,
  },
  {
    title: "Category Management",
    url: "/dashboard/moderator/categories",
    icon: LuClipboardList,
  },
  {
    title: "Dispute Management",
    url: "/dashboard/moderator/disputes",
    icon: LuClipboardList,
    child: [
      {
        title: "Pending Review",
        url: "/dashboard/moderator/disputes/pending",
        icon: LucideAlertTriangle,
      },
      {
        title: "Resolved Cases",
        url: "/dashboard/moderator/disputes/resolved",
        icon: LuHistory,
      },
    ],
  },
  {
    title: "Content Review",
    url: "/dashboard/moderator/content",
    icon: LuMonitor,
    child: [
      {
        title: "Task Comments",
        url: "/dashboard/moderator/content/comments",
        icon: LuClipboardList,
      },
      {
        title: "Mentor Messages",
        url: "/dashboard/moderator/content/mentor-messages",
        icon: LuUsers,
      },
    ],
  },
  {
    title: "Moderation Logs",
    url: "/dashboard/moderator/logs",
    icon: LuHistory,
  },
  {
    title: "Flagged Tasks",
    url: "/dashboard/moderator/flags",
    icon: LucideAlertTriangle,
  },
  {
    title: "User Reports",
    url: "/dashboard/moderator/reports",
    icon: LuSearch,
  },
];

export const MenuItemsAdmin = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LuLayoutDashboard,
  },
  {
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: LuUsers,
    child: [
      {
        title: "Moderators",
        url: "/dashboard/admin/users/moderators",
        icon: LuShieldCheck,
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
    icon: LuBrain,
    child: [
      {
        title: "AI Rules",
        url: "/dashboard/admin/ai/rules",
        icon: LuListChecks,
      },
      {
        title: "Moderation Logs",
        url: "/dashboard/admin/ai/logs",
        icon: LuHistory,
      },
      {
        title: "AI Training Feedback",
        url: "/dashboard/admin/ai/feedback",
        icon: LuStar,
      },
    ],
  },
  {
    title: "Subscription Management",
    url: "/dashboard/admin/subscriptions",
    icon: LuBadgeDollarSign,
  },
  {
    title: "Payment Management",
    url: "/dashboard/admin/payments",
    icon: LuDollarSign,
    child: [
      {
        title: "All Transactions",
        url: "/dashboard/admin/payments",
        icon: LuDollarSign,
      },
      {
        title: "Pending/Hold",
        url: "/dashboard/admin/payments/hold",
        icon: LuListChecks,
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
    icon: LuSettings,
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
    icon: LuClipboardList,
    child: [
      {
        title: "New Task/Job",
        url: "/dashboard/poster/newTask",
        icon: LuClipboardPlus,
      },
      {
        title: "Your Tasks/Jobs",
        url: "/dashboard/poster/yourTasks",
        icon: LuListChecks,
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
    url: "/dashboard/poster/mentors",
    icon: LuUsers,
    child: [
      {
        title: "Browse Mentors",
        url: "/dashboard/poster/mentors",
        icon: LuSearch,
      },
      {
        title: "Bookings",
        url: "/dashboard/poster/bookings",
        icon: LuCalendar,
      },
      {
        title: "Past Sessions",
        url: "/dashboard/poster/history",
        icon: LuHistory,
      },
      {
        title: "Workspace",
        url: "/dashboard/poster/workspace",
        icon: LuMonitor,
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
    title: "Tasks & Jobs",
    url: "/dashboard/tasks",
    icon: Bug,
    child: [
      {
        title: "Assigned Tasks",
        url: "/dashboard/solver/assignedTasks",
        icon: LuClipboardCheck,
      },
      {
        title: "Earnings",
        url: "/dashboard/solver/earnings",
        icon: LuDollarSign,
      },
    ],
  },
  {
    title: "Mentorship",
    url: "/dashboard/solver/mentor",
    icon: LuUsers,
    child: [
      {
        title: "Workspace",
        url: "/dashboard/solver/mentor",
        icon: LuMonitor,
      },
      {
        title: "My Reviews",
        url: "/dashboard/solver/reviews",
        icon: LuStar,
      },
      {
        title: "Mentor Listing",
        url: "/dashboard/solver/listing",
        icon: LuUserPlus,
      },
      {
        title: "Upgrade to Solver++",
        url: "/dashboard/solver/upgrade",
        icon: LuArrowUpRight,
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
