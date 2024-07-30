import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import FetchAPI from "../../FetchAPI";
import axios from "axios";

jest.mock('axios');

describe("FetchAPI Component", () => {
    test('fetches and displays posts on component mount', async () => {
        const mockResponse = { data: [{ id: 1, title: "Test Post", body: "This is a test post." }] };
        axios.get.mockResolvedValue(mockResponse);

        render(<FetchAPI />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts');
            expect(screen.getByText("Test Post")).toBeInTheDocument();
            expect(screen.getByText("This is a test post.")).toBeInTheDocument();
        });
    });

    test('creates a new post and updates the UI', async () => {
        const mockPost = { id: 2, title: "New Post", body: "This is a new post." };
        axios.post.mockResolvedValue({ data: mockPost });

        const { getByLabelText, getByText, findByText } = render(<FetchAPI />);

        // Fill out the form
        fireEvent.change(getByLabelText(/Title:/i), { target: { value: "New Post" } });
        fireEvent.change(getByLabelText(/Body:/i), { target: { value: "This is a new post." } });
        fireEvent.click(getByText(/Add Post/i));

        await findByText("New Post");

        expect(axios.post).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts', { title: "New Post", body: "This is a new post." });
        expect(screen.getByText("New Post")).toBeInTheDocument();
        expect(screen.getByText("This is a new post.")).toBeInTheDocument();
    });

    test('edits a post and updates the UI', async () => {
        const initialPosts = [{ id: 1, title: "Old Post", body: "This is an old post." }];
        const updatedPost = { id: 1, title: "Updated Post", body: "This post has been updated." };

        axios.get.mockResolvedValue({ data: initialPosts });
        axios.put.mockResolvedValue({ data: updatedPost });

        render(<FetchAPI />);

        await waitFor(() => expect(screen.getByText("Old Post")).toBeInTheDocument());

        // Start editing
        fireEvent.click(screen.getByText(/Edit/i));
        fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: "Updated Post" } });
        fireEvent.change(screen.getByLabelText(/Body:/i), { target: { value: "This post has been updated." } });
        fireEvent.click(screen.getByText(/Update Post/i));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1', { title: "Updated Post", body: "This post has been updated." });
            expect(screen.getByText("Updated Post")).toBeInTheDocument();
            expect(screen.getByText("This post has been updated.")).toBeInTheDocument();
        });
    });

    test('deletes a post and updates the UI', async () => {
        const initialPosts = [{ id: 1, title: "Post to Delete", body: "This post will be deleted." }];
        axios.get.mockResolvedValue({ data: initialPosts });
        axios.delete.mockResolvedValue({});

        render(<FetchAPI />);

        await waitFor(() => expect(screen.getByText("Post to Delete")).toBeInTheDocument());

        
        const deleteButtons = await screen.findAllByText(/Delete/i);
        expect(deleteButtons.length).toBe(1); 

        fireEvent.click(deleteButtons[0]); 

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');
            expect(screen.queryByText("Post to Delete")).not.toBeInTheDocument();
        });
    });

    test('matches the snapshot', () => {
        const { asFragment } = render(<FetchAPI />);
        expect(asFragment()).toMatchSnapshot();
    });
});
