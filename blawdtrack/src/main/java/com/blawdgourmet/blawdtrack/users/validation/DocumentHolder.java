package com.blawdgourmet.blawdtrack.users.validation;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;

public interface DocumentHolder {
    DocumentType documentType();
    String documentNumber();
}
