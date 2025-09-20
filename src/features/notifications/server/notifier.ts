import { saveSystemNotification, sendNotificationByEmail } from "./action";

export type emailBodyType = { content: string; subject: string };
export type systemBodyType = { content: string; subject: string };

type NotificationBase = {
  send(): Promise<any>;
};

type NotificationBuilder = {
  system(options: {
    receiverId: string;
    content: string;
    subject: string;
  }): NotificationBuilder & NotificationBase;
  email(options: {
    receiverEmail: string;
    content: string;
    subject: string;
  }): NotificationBuilder & NotificationBase;
};

export function Notifier(options?: { sender?: string }): NotificationBuilder {
  const state: {
    sender: string;
    system?: { receiverId: string; content: string; subject: string };
    email?: {
      receiverEmail: string;
      content: string;
      subject: string;
    };
  } = { sender: options?.sender ?? "solveit@org.com" };

  const methods: NotificationBuilder & NotificationBase = {
    system: ({ content, subject, receiverId }) => {
      state.system = { receiverId, content, subject };
      return methods;
    },
    email: ({ receiverEmail, content, subject }) => {
      state.email = { receiverEmail, content, subject };
      return methods;
    },
    send: async () => {
      if (!state.system && !state.email) {
        throw new Error(
          "[NotificationBuilder] No channels specified. " +
            "Did you forget `.system(...)` or `.email(...)` before `.send()`?"
        );
      }

      const promises: Promise<any>[] = [];
      if (state.system) {
        promises.push(
          saveSystemNotification({
            sender: state.sender,
            receiverId: state.system.receiverId,
            body: {
              content: state.system.content,
              subject: state.system.receiverId,
            },
          })
        );
      }
      if (state.email) {
        promises.push(
          sendNotificationByEmail({
            sender: state.sender,
            receiverEmail: state.email.receiverEmail,
            body: {
              content: state.email.content,
              subject: state.email.subject,
            },
          })
        );
      }
      return Promise.all(promises);
    },
  };

  return methods;
}
