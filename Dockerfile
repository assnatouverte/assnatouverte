FROM denoland/deno:alpine-2.0.6

# Deployment ID from git revision
ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

# Copy the source files
COPY . .

# Cache dependencies and build
WORKDIR website
RUN deno cache main.ts
RUN deno task build

# Port exposed
EXPOSE 8000

CMD ["deno", "run", "-A", "main.ts"]
