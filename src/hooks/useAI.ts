"use client";

import { useCompletion } from "@ai-sdk/react";
import {useState} from "react";

// ── Generate description (streaming) ──────────────────────────────

export function useGenerateDescription() {
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading]   = useState(false);

    async function generate(title: string, projectName: string) {
        setIsLoading(true);
        setCompletion("");

        try {
            const res = await fetch("/api/ai/generate-description", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ title, projectName }),
            });

            const reader  = res.body!.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setCompletion((prev) => prev + chunk);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return { generate, completion, isLoading };
}

// ── Summarize comments ────────────────────────────────────────────

export function useSummarizeComments() {
    const [summary,   setSummary]   = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function summarize(issueId: string) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/summarize-comments", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ issueId }),
            });

            if (!res.ok) {
                setSummary("Failed to summarize. Try again.");
                return;
            }

            const data = await res.json();
            setSummary(data.summary);
        } catch {
            setSummary("Failed to summarize. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return { summarize, summary, isLoading, setSummary };
}

// ── Suggest priority ──────────────────────────────────────────────

export function useSuggestPriority() {
    const [suggestion, setSuggestion] = useState<{
        priority: string;
        reason: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function suggest(title: string, description: string) {
        setIsLoading(true);
        try {
            const res  = await fetch("/api/ai/suggest-priority", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ title, description }),
            });
            const data = await res.json();
            setSuggestion(data);
        } finally {
            setIsLoading(false);
        }
    }

    return { suggest, suggestion, isLoading };
}