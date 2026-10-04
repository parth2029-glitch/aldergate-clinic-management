package com.aldergate.clinic.exception;

/** Maps to HTTP 409 — a unique constraint the client violated (e.g. email already registered). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
