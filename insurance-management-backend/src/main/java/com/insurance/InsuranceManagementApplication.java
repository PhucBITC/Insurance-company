package com.insurance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InsuranceManagementApplication {

    public static void main(String[] args) {
        // Automatically load environment variables from .env file if it exists
        String[] possiblePaths = {".env", "../.env", "insurance-management-backend/.env"};
        for (String path : possiblePaths) {
            java.io.File envFile = new java.io.File(path);
            if (envFile.exists()) {
                try {
                    java.nio.file.Files.lines(envFile.toPath())
                        .map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                        .forEach(line -> {
                            String[] parts = line.split("=", 2);
                            if (parts.length == 2) {
                                String key = parts[0].trim();
                                String value = parts[1].trim();
                                if (value.startsWith("\"") && value.endsWith("\"")) {
                                    value = value.substring(1, value.length() - 1);
                                }
                                System.setProperty(key, value);
                            }
                        });
                    System.out.println("Loaded environment variables from " + envFile.getAbsolutePath());
                    break; 
                } catch (Exception e) {
                    System.err.println("Error reading .env from " + path + ": " + e.getMessage());
                }
            }
        }
        
        SpringApplication.run(InsuranceManagementApplication.class, args);
    }
}
