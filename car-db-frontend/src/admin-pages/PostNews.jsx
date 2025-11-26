function PostNews() {
    return (
        <div className="min-h-full mt-10 mx-4 lg:mt-20 lg:mx-32">
            <form className="flex flex-col flex-grow gap-5">
                <div className="bg-gray-800 p-4 gap-4 flex flex-col">
                    <p className="text-white text-2xl font-semibold underline">Images</p>
                    <div>
                        <label htmlFor="phone" className="block mb-2.5 text-sm font-medium text-heading">Upload your Images</label>
                        <input name="phone" type="text" id="phone" className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs" placeholder="090828372" required />
                    </div>
                </div>

                <div className="bg-gray-800 p-4 gap-4 flex flex-col">
                    <p className="text-white text-2xl font-semibold underline">Contents</p>
                    <div>
                        <label htmlFor="phone" className="block mb-2.5 text-sm font-medium text-heading">Write your contents</label>
                        <input name="phone" type="text" id="phone" className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs" placeholder="Write your contents here..." required />
                    </div>
                </div>

                <div className="flex justify-center py-10">
                    <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 font-medium px-20 py-2.5 rounded">Post News</button>
                </div>
            </form>
        </div>
    );
}

export default PostNews;