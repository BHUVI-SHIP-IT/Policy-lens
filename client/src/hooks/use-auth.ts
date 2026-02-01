import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: user, isLoading, error } = useQuery<User | null>({
        queryKey: ["/api/user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (res.status === 401) return null;
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json();
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (!res.ok) throw new Error("Failed to logout");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
            toast({
                title: "Logged out",
                description: "You have been successfully logged out",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        user,
        isLoading,
        error,
        logout: () => logoutMutation.mutate(),
    };
}
