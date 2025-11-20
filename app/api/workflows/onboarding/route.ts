import { serve } from "@upstash/workflow/nextjs"

type InitialData = {
  email: string
}

export const { POST } = serve<InitialData>(async (context) => {
  const { email } = context.requestPayload

  //sending newly signed up user a welcome email
  await context.run("new-signup", async () => {
    await sendEmail("Welcome to BookMyst", email)
  })

  //pausing workflow for 3 days
  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3)

  //We enter an infinite loop to periodically (every month) check the user’s 
  //engagement level with our platform and send appropriate emails
  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState()
    })

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail("BookMyst misses you :(", email)
      })
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail("We're glad you like us!", email)
      })
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30)
  }
})

async function sendEmail(message: string, email: string) {
  // Implement email sending logic here
  console.log(`Sending ${message} email to ${email}`)
}

type UserState = "non-active" | "active"

const getUserState = async (): Promise<UserState> => {
  // Implement user state logic here
  return "non-active"
}