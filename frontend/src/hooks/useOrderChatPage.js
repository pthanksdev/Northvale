import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function useOrderChatPage() {
  const { id } = useParams();
  const { user, isSignedIn } = useAuth();
  const { paid } = useOutletContext();

  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  const role = user?.role;

  const inviteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/orders/${id}/video-invite`, { method: "POST" }),
  });

  useEffect(() => {
    if (!paid || !id || !isSignedIn) return undefined;

    let chatClient;

    async function connectOrderChat() {
      await apiFetch(`/api/orders/${id}/stream-channel`, { method: "POST" });

      const token = await apiFetch("/api/stream/token", { method: "POST" });

      chatClient = StreamChat.getInstance(token.apiKey);

      await chatClient.connectUser({ id: token.userId, name: token.name }, token.token);

      const channel = chatClient.channel("messaging", `order-${id}`);

      await channel.watch();
      setClient(chatClient);
    }

    connectOrderChat().catch((e) => {
      setError(e instanceof Error ? e.message : "Chat failed to load");
    });

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [paid, id, isSignedIn]);

  const channel = client && id ? client.channel("messaging", `order-${id}`) : null;
  const canInvite = role === "support" || role === "admin";

  return { paid, client, error, channel, canInvite, inviteMutation };
}
