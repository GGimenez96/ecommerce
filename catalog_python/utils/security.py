import http.client
import socket
import utils.json_serializer as json
import utils.errors as errors
import memoize

memoKeys = {}

memo = memoize.Memoizer(memoKeys)


@memo(max_age=3600)
def isValidToken(authKey):
    """
    Obtiene el currentUser desde el servicio de authenticacion
    authKey: string El header Authorization enviado por el cliente
    return dict<property, value> CurrentUser
    """
    if (not isinstance(authKey, str) or len(authKey) == 0):
        raise errors.InvalidAuth()

    headers = {"Authorization".encode("utf-8"): authKey.encode("utf-8")}

    conn = http.client.HTTPConnection(socket.gethostbyname("localhost"), 3000)

    conn.request("GET", "/auth/currentUser", {}, headers)
    response = conn.getresponse()

    if (response.status != 200):
        raise errors.InvalidAuth()

    result = json.body_to_dic(response.read().decode('utf-8'))
    if (len(result) == 0):
        raise errors.InvalidAuth()

    print(result)
    return result


def validateAdminRole(token):
    """
    Valida si el usuario actual tiene rol de admin.\n
    token: string Header Auth Token
    """
    profile = isValidToken(token)
    print(profile)
    print(profile["roles"])
    if ("roles" not in profile or "admin" not in profile["roles"]):
        raise errors.InvalidAuth()


def invalidateSession(token):
    """
    Invalida un token del cache.\n
    token: string Header Auth Token
    """
    if (isinstance(token, str) and isValidToken.exists((token, ))):
        print("Key eliminada %r" % token)
        isValidToken.delete((token, ))
