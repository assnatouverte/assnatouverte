FROM denoland/deno:alpine-2.0.6

# Deployment ID from git revision
ARG GIT_COMMIT_SHA
ARG GIT_COMMIT_DATE_UNIX
ENV DENO_DEPLOYMENT_ID=${GIT_COMMIT_SHA}
ENV DENO_DEPLOYMENT_DATE_UNIX=${GIT_COMMIT_DATE_UNIX}

# Copy the source files
COPY . .

# Cache dependencies and build
WORKDIR website
RUN deno cache main.ts
RUN deno task build

# Port exposed
EXPOSE 8000

CMD ["deno", "run", "-A", "main.ts"]
