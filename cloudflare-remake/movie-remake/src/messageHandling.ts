export function getMessagesPrompt(chat) {
  let messages = [];

  chat.map((message) => {
    const role = message.name == "Me" ? "user" : "assistant";
    const m = { role: role, content: message.message };
    messages.push(m);
  });

  return messages;
}

export async function sendEvent(writer, data) {
  let encoder = new TextEncoder();
  await writer.write(encoder.encode(`event: add\n`));
  await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}
