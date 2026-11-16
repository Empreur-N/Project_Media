package com.media.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "service", "LIFE CHANNEL API Gateway",
            "status", "UP",
            "message", "Passerelle API active. Pour accéder au site web officiel, visitez le portail principal.",
            "web_portal", "http://62.169.27.157/"
        );
    }
}
