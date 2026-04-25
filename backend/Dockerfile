FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./
RUN npm install --legacy-peer-deps

COPY . .

# Build Medusa with admin dashboard
RUN npx medusa build

# Install production deps in the built output
RUN cd .medusa/server && npm install --legacy-peer-deps

EXPOSE 9000

CMD ["sh", "-c", "cd .medusa/server && npx medusa db:migrate && npx medusa start"]
