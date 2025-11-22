// import Image from "next/image";
import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/database/drizzle";
import { books, users } from "@/database/schema";
import { desc } from "drizzle-orm";
import type { Book } from "@/types";

const Home = async () => {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : "";

  const latestBooks = (await db
    .select()
    .from(books)
    .limit(10)
    .orderBy(desc(books.createdAt))) as Book[];
  const result = await db.select().from(users);
  console.log(JSON.stringify(result, null, 2));

  if (!latestBooks.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-light-100">No books available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <BookOverview {...latestBooks[0]} userId={userId} />
      {latestBooks.length > 1 && (
        <BookList
          title="Latest Books"
          books={latestBooks.slice(1)}
          containerClassName="mt-28"
        />
      )}
    </>
  );
};

export default Home;
