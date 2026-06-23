import {
    Circle, CircleDot, CircleCheck, CircleX,
    CircleDashed, ArrowDown, ArrowRight,
    ArrowUp, AlertCircle, Minus,
} from "lucide-react";

export const STATUS_CONFIG = {
    backlog: {
        label: "Backlog",
        icon: CircleDashed,
        color: "text-slate-400",
        bg:    "bg-slate-100",
    },
    todo: {
        label: "Todo",
        icon: Circle,
        color: "text-blue-400",
        bg:    "bg-blue-50",
    },
    in_progress: {
        label: "In Progress",
        icon: CircleDot,
        color: "text-yellow-500",
        bg:    "bg-yellow-50",
    },
    done: {
        label: "Done",
        icon: CircleCheck,
        color: "text-green-500",
        bg:    "bg-green-50",
    },
    cancelled: {
        label: "Cancelled",
        icon: CircleX,
        color: "text-slate-400",
        bg:    "bg-slate-100",
    },
} as const;

export const PRIORITY_CONFIG = {
    none: {
        label: "No priority",
        icon: Minus,
        color: "text-slate-400",
    },
    low: {
        label: "Low",
        icon: ArrowDown,
        color: "text-slate-500",
    },
    medium: {
        label: "Medium",
        icon: ArrowRight,
        color: "text-blue-500",
    },
    high: {
        label: "High",
        icon: ArrowUp,
        color: "text-orange-500",
    },
    urgent: {
        label: "Urgent",
        icon: AlertCircle,
        color: "text-red-500",
    },
} as const;

export type IssueStatus   = keyof typeof STATUS_CONFIG;
export type IssuePriority = keyof typeof PRIORITY_CONFIG;
export const ALL_STATUSES = Object.keys(STATUS_CONFIG) as IssueStatus[];