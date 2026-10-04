package com.aldergate.clinic.exception;

/** Maps to HTTP 400 — a request that is well-formed but violates a business rule. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
