# Stop and remove running containers
docker-compose down

# Prune unused volumes
docker volume prune -f

# Stop and remove all containers
docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q)

# Remove all Docker images
docker rmi -f $(docker images -a -q)
