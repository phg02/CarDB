import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function PostNews() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    // Accumulate images (add to existing ones)
    setImagePreviews((prev) => [...prev, ...previews]);
    setImageFiles((prev) => [...prev, ...files]);

    // Reset input value so the same file can be selected again
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (title.trim().length < 5) {
      toast.error("Title must be at least 5 characters long");
      return;
    }

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    if (content.trim().length < 20) {
      toast.error("Content must be at least 20 characters long");
      return;
    }

    if (!auth?.accessToken) {
      toast.error("You must be logged in to post news");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // Upload all images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Use token from auth context, not localStorage
      const token = auth.accessToken;
      const response = await axios.post("/api/news/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("News posted successfully");
        setTitle("");
        setContent("");
        setImagePreviews([]);
        setImageFiles([]);
        // Redirect to the newly created post details after 1 second
        const newsId = response.data.data.news._id;
        setTimeout(() => {
          navigate(`/news/${newsId}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error posting news:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to post news";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full mt-10 mx-4 lg:mt-20 lg:mx-32">
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow gap-5">
        <div className="bg-gray-800 p-4 gap-4 flex flex-col">
          <p className="text-white text-2xl font-semibold underline">Images</p>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label
              htmlFor="image"
              className="block mb-2.5 text-sm font-medium text-heading"
            >
              Upload your Images
            </label>
            <label
              htmlFor="image"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm text-gray-400">Click to upload images</p>
              </div>
              <input
                name="image"
                type="file"
                id="image"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="bg-gray-800 p-4 gap-4 flex flex-col">
          <p className="text-white text-2xl font-semibold underline">
            Contents
          </p>
          <div>
            <label
              htmlFor="title"
              className="block mb-2.5 text-sm font-medium text-heading"
            >
              News Title
            </label>
            <input
              name="title"
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs"
              placeholder="Write your news title here..."
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block mb-2.5 text-sm font-medium text-heading"
            >
              Write your contents
            </label>
            <textarea
              name="content"
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs resize-none h-40"
              placeholder="Write your contents here..."
              required
            />
          </div>
        </div>

        <div className="flex justify-center py-10">
          <button
            type="submit"
            disabled={loading}
            className="text-white bg-blue-600 hover:bg-blue-800 font-medium px-20 py-2.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Posting..." : "Post News"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostNews;
