import {
  BadgePlus,
  BookCheck,
  Bug,
  CalendarClockIcon,
  Home,
  LifeBuoy,
  LucideAlertTriangle,
  LucideBadgeDollarSign,
  LucideBrain,
  LucideCalendar,
  LucideClipboardCheck,
  LucideClipboardList,
  LucideClipboardPlus,
  LucideDollarSign,
  LucideFileQuestion,
  LucideFlaskConical,
  LucideHandshake,
  LucideHistory,
  LucideIcon,
  LucideLayoutDashboard,
  LucideListChecks,
  LucidePackage,
  LucidePieChart,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
  LucideUserPlus,
  LucideUsers,
  PackageOpen,
  Rss,
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
        title: "My Assigned Disputes",
        url: "/dashboard/moderator/my-disputes",
        icon: LucideClipboardCheck,
      },
    ],
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
        url: "/dashboard/admin/moderators",
        icon: LucideShieldCheck,
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
        url: "/dashboard/admin/ai/rules",
        icon: LucideHistory,
      },
      {
        type: "link",
        title: "Rule Sandbox",
        url: "/dashboard/admin/ai/rule-sandbox",
        icon: LucideFlaskConical,
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
    ],
  },
  {
    type: "category",
    title: "Blog Management",
    url: "/dashboard/admin/blog",
    icon: Rss,
    child: [
      {
        type: "link",
        title: "Blog",
        url: "/dashboard/admin/blog",
        icon: Rss,
      },
      {
        type: "link",
        title: "New Blog",
        url: "/dashboard/admin/blog/new",
        icon: BadgePlus,
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
        url: "/dashboard/poster/new-task",
        icon: LucideClipboardPlus,
      },
      {
        type: "link",
        title: "Your Tasks/Jobs",
        url: "/dashboard/poster/your-tasks",
        icon: LucideListChecks,
      },
      {
        type: "link",
        title: "Disputes / Support",
        url: "/dashboard/poster/disputes",
        icon: LucideFileQuestion,
      },
      // {
      //   type: "link",
      //   title: "Task Analytics",
      //   url: "/dashboard/poster/task-analytics",
      //   icon: LucideBarChart3,
      // },
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
      // {
      //   type: "link",
      //   title: "Past Sessions",
      //   url: "/dashboard/poster/history",
      //   icon: LucideHistory,
      // },
      // {
      //   type: "link",
      //   title: "Workspace",
      //   url: "/dashboard/poster/workspace",
      //   icon: LucideMonitor,
      // },
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
        url: "/dashboard/solver/assigned-tasks",
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
    url: "/dashboard/solver/sessions",
    icon: LucideUsers,
    child: [
      {
        type: "link",

        title: "Sessions",
        url: "/dashboard/solver/sessions",
        icon: LucideUserPlus,
      },
      {
        type: "link",

        title: "Mentor Listing",
        url: "/dashboard/solver/listing",
        icon: LucideUserPlus,
      },
    ],
  },
  // {
  //   type: "category",
  //   title: "Reputation & Reports",
  //   url: "/dashboard/solver/reputation",
  //   icon: LucideChartLine,
  //   child: [
  //     {
  //       type: "link",
  //       title: "My Reputation",
  //       url: "/dashboard/solver/reputation",
  //       icon: LucideTrendingUp,
  //     },
  //     {
  //       type: "link",
  //       title: "My Analytics",
  //       url: "/dashboard/solver/analysis",
  //       icon: LucideBarChart3,
  //     },
  //   ],
  // },
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
