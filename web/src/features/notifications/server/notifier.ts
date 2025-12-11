import { processSystemNotification, sendNotificationByEmail } from "./action";

export type emailBodyType = { content: string; subject: string };
export type systemBodyType = { content: string; subject: string };

type NotificationBuilder = {
  system(options: {
    receiverId: string;
    content: string;
    subject: string;
  }): NotificationBuilder;
  email(options: {
    receiverEmail: string;
    content: string;
    subject: string;
  }): NotificationBuilder;
};

export function Notifier(options?: { sender: string }): NotificationBuilder {
  const sender = options?.sender ?? "solveit@org.com";

  const methods: NotificationBuilder = {
    system: ({ content, subject, receiverId }) => {
      void processSystemNotification({
        sender,
        receiverId,
        body: { content, subject },
      });
      return methods;
    },
    email: ({ receiverEmail, content, subject }) => {
      void sendNotificationByEmail({
        sender,
        receiverEmail,
        body: { content, subject },
      });
      return methods;
    },
  };

  return methods;
}
