import React, { useState, useEffect } from "react";
import axios from "axios";

const FetchAPI = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', body: '' });
    const [editingPost, setEditingPost] = useState(null);

    // Function to fetch posts
    const fetchPosts = async () => {
        try {
            const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    // Function to create a new post
    const createPost = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://jsonplaceholder.typicode.com/posts', newPost);
            setPosts([...posts, response.data]); // Update state with the new post
            setNewPost({ title: '', body: '' }); // Clear the form
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    // Function to handle edit
    const startEdit = (post) => {
        setEditingPost(post);
        setNewPost({ title: post.title, body: post.body });
    };

    // Function to update a post
    const updatePost = async (e) => {
        e.preventDefault();
        if (!editingPost) return;

        try {
            const response = await axios.put(`https://jsonplaceholder.typicode.com/posts/${editingPost.id}`, newPost);
            setPosts(posts.map(post => post.id === editingPost.id ? response.data : post)); // Update the specific post
            setEditingPost(null); // Clear the editing state
            setNewPost({ title: '', body: '' }); // Clear the form
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    // Function to delete a post
    const deletePost = async (id) => {
        try {
            await axios.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
            setPosts(posts.filter(post => post.id !== id)); // Remove the deleted post from the state
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    // Fetch posts when component mounts
    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            <h1>Posts</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.body}</p>
                        <button onClick={() => startEdit(post)}>Edit</button>
                        <button onClick={() => deletePost(post.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <h2>{editingPost ? "Edit Post" : "Create a New Post"}</h2>
            <form onSubmit={editingPost ? updatePost : createPost}>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="body">Body:</label>
                    <textarea
                        id="body"
                        value={newPost.body}
                        onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                        required
                    ></textarea>
                </div>
                <button type="submit">{editingPost ? "Update Post" : "Add Post"}</button>
            </form>
        </div>
    );
};

export default FetchAPI;