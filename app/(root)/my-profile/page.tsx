import { signOut } from "@/auth";
import BookList from "@/components/BookList";
import { Button } from "@/components/ui/button";
import React from "react";
import sampleBooks from "@/dummybooks.json";
const Page = () => {
  return (
    <>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
        className="mb-10"
      >
        <Button>Logout</Button>
      </form>
      <BookList title = "Borrowed Books" books = {sampleBooks} />
   
</>
  );
};

export default Page;
