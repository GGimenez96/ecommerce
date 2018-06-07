"use strict";

/**
 * Son eventos enviados a rabbit.
 */
import amqp = require("amqplib");

export interface IRabbitMessage {
    type: string;
    message: any;
}


export interface IArticleExistMessage {
    type: string;
    cartId: string;
    articleId: string;
}
let channel: amqp.Channel;

/**
 * @api {broadcast} cart/catalog Comprobar Articulo
 * @apiGroup RabbitMQ
 *
 * @apiDescription Cart envia un mensaje a Catalog para comprobar la validez de un articulo.
 *
 * @apiParamsExample {json} Mensaje
 *     {
 *        "type": "article-exist",
 *        "cartId": "{cartId}",
 *        "articleId": "{articleId}",
 *     }
 *
 * @apiSuccessExample {json} Mensaje
 *     {
 *        "type": "article-exist",
 *        "cartId": "{cartId}",
 *        "articleId": "{articleId}",
 *        "valid": true|false
 *     }
 */
/**
 * Envia una peticion a catalog para validar si un articulo puede incluirse en el cart.
 */
export function sendArticleValidation(cartId: string, articleId: string): Promise<IRabbitMessage> {
    const message: IRabbitMessage = {
        type: "article-exist",
        message: {
            cartId: cartId,
            articleId: articleId
        }
    };

    const EXCHANGE = "catalog";
    const QUEUE = "catalog";

    return new Promise<IRabbitMessage>((resolve, reject) => {
        getChannel().then(
            (channel) => {
                channel.assertExchange(EXCHANGE, "direct", { durable: false });
                channel.assertQueue(QUEUE, { durable: false });

                if (channel.publish(EXCHANGE, QUEUE, new Buffer(JSON.stringify(message)))) {
                    resolve(message);
                    console.log("RabbitMQ Cart : Article check encolado " + message);
                } else {
                    reject();
                }
            }).catch(
                (err) => {
                    return new Promise<IArticleExistMessage>((resolve, reject) => {
                        console.log("RabbitMQ Cart " + err);
                        reject();
                    });
                });
    });
}

function getChannel(): Promise<amqp.Channel> {
    return new Promise((resolve, reject) => {
        if (channel) {
            return resolve(channel);
        }

        amqp.connect("amqp://localhost").then(
            (conn) => {
                conn.createChannel().then(
                    (chn) => {
                        console.log("RabbitMQ Cart conectado");

                        channel = chn;
                        channel.on("close", function () {
                            console.error("RabbitMQ Cart Conexion cerrada");
                            channel = undefined;
                        });
                        resolve(channel);
                    },
                    (onReject) => {
                        console.error("RabbitMQ Cart " + onReject.message);
                        channel = undefined;
                        reject();
                    }
                );
            },
            (onReject) => {
                console.error("RabbitMQ Cart " + onReject.message);
                channel = undefined;
                reject();
            });
    });
}

