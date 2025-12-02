export function generateRefundNotificationEmail({ title }: { title: string }) {
  return `
    <p>Hello Moderator,</p>
    <p>
      An **urgent new refund request** has been initiated for the task titled
      "<strong>${title}</strong>".
    </p>
    <p>
      The solver associated with this task has been blocked, and the request is now
      **awaiting your immediate review**.
    </p>
    <p>
      Please visit the task page as soon as possible to review the comments
      and process the refund request.
    </p>
    <p>Thank you for your  attention to this matter.</p>
  `;
}
