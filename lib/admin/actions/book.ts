'use server'

const createBook = async(params: BookParams) => {
    try {
        const newBook = await db.insert(books);
    } catch (error) {
        console.log(error);
        return{
            success:false,
            message:'An error occurred while creating the book';
        }
    }
}