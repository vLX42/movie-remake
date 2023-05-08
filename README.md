# Hollywood Movie Remake Generator

Welcome to the Hollywood Movie Remake Generator, an open source web project that generates creative remakes of Hollywood movies using cutting-edge technology. This project is built using Next.js, React 18's Server Components, and the new App Router feature. It leverages OpenAI API, ChatGPT-4, and Stable Diffusion to power the movie remake generation.

## Features

- Movie search using The Movie Database (TMDB) API
- Movie generation using SSE (Server-Side Events) in a Cloudflare worker
- Cloudflare KV and Images for caching
- AWS Lambda example using response streaming as an alternative to SSE
- Informative slideshow explaining the technical aspects of the project

## Project Structure

The project is organized into the following folders:

- `cloudflare-remake`: Contains the SSE API implementation
- `frontend`: The Next.js project containing the user interface
- `lambda-streaming-ttfb-write-sam`: AWS Lambda example showcasing response streaming
- `slides`: Slideshow explaining the technical aspects of the project

## Usage

Feel free to use the streaming examples provided in this project to build your own AI applications. However, we kindly ask that you don't clone the entire site; instead, use the provided examples and create your own unique AI-powered applications.

## API Execution and Streaming

Due to the long-running execution time of the movie remake generation process, the API needs to be implemented as a Cloudflare worker or an AWS Lambda function. Using a Next.js API would result in termination before the process is complete.

To ensure a seamless experience for the end user, we use Server-Side Events (SSE) to stream the response. This enables the application to deliver the generated content as it becomes available, rather than waiting for the entire process to finish before sending the response.

## Contributing

We welcome contributions from the community! If you have ideas or improvements, please submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React 18](https://reactjs.org/blog/2021/06/08/the-plan-for-react-18.html)
- [OpenAI API](https://beta.openai.com/)
- [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [DFDS](https://www.dfds.com/)

This project was created as part of an internal knowledge-sharing session at DFDS.
