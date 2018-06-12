"use strict";

import { Document, model, Schema } from "mongoose";

/*
Son tokens de sesión se guardan en la base de datos.
Para deshabilitar un token hay que poner valida=false
*/
export interface IToken extends Document {
  valid: boolean;
  user: Schema.Types.ObjectId;
}

export let TokenSchema = new Schema({
  valid: {
    type: Boolean,
    default: true,
    required: "Valid es requerido"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: "Usuario es requerido"
  }
}, { collection: "tokens" });

export let Token = model<IToken>("Token", TokenSchema);