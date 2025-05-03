# Kubernetes Deployment Instructions

## Prerequisites
- Kubernetes cluster (Minikube, Docker Desktop Kubernetes, or cloud provider)
- kubectl CLI tool
- Docker

## Build and Push Images

1. Build all service images:
```bash
# Auth Service
docker build -t food-ordering-auth-service:latest -f services/auth-service/Dockerfile .

# Restaurant Service
docker build -t food-ordering-restaurant-service:latest -f services/restaurant-service/Dockerfile .

# Order Service
docker build -t food-ordering-order-service:latest -f services/order-service/Dockerfile .

# Delivery Service
docker build -t food-ordering-delivery-service:latest -f services/delivery-service/Dockerfile .

# Payment Service
docker build -t food-ordering-payment-service:latest -f services/payment-service/Dockerfile .

# Notification Service
docker build -t food-ordering-notification-service:latest -f services/notification-service/Dockerfile .

# Client
docker build -t food-ordering-client:latest -f client/Dockerfile .
```

## Deployment Steps

1. Create namespace:
```bash
kubectl create namespace food-ordering
```

2. Apply ConfigMap and Secrets:
```bash
kubectl apply -f k8s/config.yaml -n food-ordering
```

3. Deploy MongoDB:
```bash
kubectl apply -f k8s/mongodb/mongodb-deployment.yaml -n food-ordering
```

4. Deploy Microservices:
```bash
kubectl apply -f k8s/auth/auth-deployment.yaml -n food-ordering
kubectl apply -f k8s/restaurant/restaurant-deployment.yaml -n food-ordering
kubectl apply -f k8s/order/order-deployment.yaml -n food-ordering
kubectl apply -f k8s/delivery/delivery-deployment.yaml -n food-ordering
kubectl apply -f k8s/payment/payment-deployment.yaml -n food-ordering
kubectl apply -f k8s/notification/notification-deployment.yaml -n food-ordering
kubectl apply -f k8s/client/client-deployment.yaml -n food-ordering
```

5. Deploy Ingress:
```bash
kubectl apply -f k8s/ingress/ingress.yaml -n food-ordering
```

## Verify Deployment

Check the status of all deployments:
```bash
kubectl get all -n food-ordering
```

Check ingress status:
```bash
kubectl get ingress -n food-ordering
```

## Access the Application

The application will be available at:
- Frontend: http://localhost
- API endpoints: http://localhost/api/{service-name}

## Scaling

To scale any service, use:
```bash
kubectl scale deployment {service-name} --replicas={number} -n food-ordering
```

Example:
```bash
kubectl scale deployment auth-service --replicas=3 -n food-ordering
```

## Monitoring

Monitor pods:
```bash
kubectl get pods -n food-ordering -w
```

View logs:
```bash
kubectl logs -f deployment/{service-name} -n food-ordering
```
