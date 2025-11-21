"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Changed from next/router
import { toast } from "sonner";
import { borrowBook } from "@/lib/actions/book";

interface Props {
  userId: string;
  bookId: string;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
}

const BorrowBook = ({ // Removed async
  userId,
  bookId,
  borrowingEligibility: { isEligible, message },
}: Props) => {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);
  
  const handleBorrow = async () => {
    if (!isEligible) {
      toast.error(message);
      return; // Added return to stop execution
    }

    setBorrowing(true);

    try {
      const result = await borrowBook({ bookId, userId });
      if (result.success) {
        toast.success("Book borrowed successfully");
        router.push("/my-profile");
      } else {
        toast.error("An error occurred while borrowing the book");
      }
    } catch (error) {
      toast.error("An error occurred while borrowing the book");
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <Button
      className="book-overview_btn"
      onClick={handleBorrow}
      disabled={borrowing}
    >
      <Image src="/icons/book.svg" alt="book" width={20} height={20} />
      <p className="font-bebas-neue text-xl text-dark-100">
        {borrowing ? 'Borrowing...' : 'Borrow Book'}
      </p>
    </Button>
  );
};

export default BorrowBook;