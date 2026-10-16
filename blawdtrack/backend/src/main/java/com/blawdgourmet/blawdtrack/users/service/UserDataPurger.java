package com.blawdgourmet.blawdtrack.users.service;

/**
 * Puerto por el que otros módulos (auth, audit...) dejan libre a un usuario de los registros propios que lo
 * referencian antes de eliminarlo. `users` no conoce a quienes lo implementan: cada módulo limpia lo suyo y un
 * módulo nuevo se suma implementando esta interfaz, sin tocar `users`.
 */
public interface UserDataPurger {

    /** Elimina o desvincula los registros de este módulo que referencian al usuario. */
    void purgeFor(Long userId);
}
