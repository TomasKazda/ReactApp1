# Build Docker image: docker build -t imageName:versionTag .
# Container run: docker run -p 8080:80 -p 8443:443 imageName:versionTag

# Build stage pro frontend
FROM node:18-alpine AS frontend-build
WORKDIR /src/reactapp1.client
COPY ./reactapp1.client/package*.json ./
RUN npm install
COPY ./reactapp1.client ./
COPY ./reactapp1.client/index.html ./
RUN ls -la
RUN ls -la ./src
RUN npm run build

# Build stage pro backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
# Instalace Node.js primo v backend-build stage
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs

COPY ["ReactApp1.Server/ReactApp1.Server.csproj", "ReactApp1.Server/"]
COPY ["reactapp1.client/reactapp1.client.esproj", "reactapp1.client/"]
RUN dotnet restore "ReactApp1.Server/ReactApp1.Server.csproj"
COPY . .
RUN dotnet build "ReactApp1.Server/ReactApp1.Server.csproj" -c Release -o /app/build

# Publish stage pro backend
FROM backend-build AS backend-publish
RUN dotnet publish "ReactApp1.Server/ReactApp1.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
#EXPOSE 80
#EXPOSE 443

# Instalace certifikátů pro HTTPS
# RUN apt-get update && \
#     apt-get install -y openssl && \
#     mkdir -p /root/.aspnet/https

# Kopírování publikovaného backendu
COPY --from=backend-publish /app/publish .

# Kopírování buildu frontendu do wwwroot adresáře
COPY --from=frontend-build /src/reactapp1.client/dist ./wwwroot

ENTRYPOINT ["dotnet", "ReactApp1.Server.dll"]