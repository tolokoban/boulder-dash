export default {
    /**
     * Execute a remote service.
     * @param {string} name - Service's name.
     * @param {any} args - Service's arguments.
     * @return {Promise<any>} Resolves in any data returned by the service.
     */
    exec,
    /**
     * Authenticate a user.
     * @param {string} username
     * @param {string} password
     * @return {Promise<User>}
     */
    login
};

export enum EnumWebServiceError {
    OK = 0,
    BAD_ROLE,
    BAD_TYPE,
    CONNECTION_FAILURE,
    MISSING_AUTOLOGIN,
    UNKNOWN_USER,
    HTTP_ERROR
}

export enum EnumLoginError {
    WRONG_CHALLENGE = -1,
    MISSING_WAITING_STATE = -2, // USER:waiting.
    MISSING_RESPONSE_STATE = -3, // USER:response.
    WRONG_LENGTH = -4, // Response has not the correct length.
    WRONG_PASSWORD = -5,
    ACCOUNT_DISABLED = -6
}

interface ICallResponse {
    code: EnumWebServiceError;
    data: any;
}

const gLastSuccessfulLogin: { username: string, password: string } = {
    username: "", password: ""
};

class User {
    constructor(
        private _email: string,
        private _nickname: string,
        private _roles: string[]) { }

    get email() { return this._email; }

    get nickname() { return this._nickname; }

    hasRole(role: string): boolean {
        return -1 !== this._roles.indexOf(role);
    }
}

async function exec(name: string, args: any): Promise<any> {
    const response: ICallResponse = await callService(name, args);
    if (response.code === EnumWebServiceError.OK) {
        const obj = JSON.parse(response.data);
        return obj;
    } else {
        throw response;
    }
}

async function callService(name: string, args: {}): Promise<ICallResponse> {
    const data = new FormData();
    data.append("s", name);
    data.append("i", JSON.stringify(args));
    const
        url = `tfw/svc.php`,
        init = { method: "POST", body: data },
        response = await fetch(url, init);
    if (response.ok) {
        return {
            code: EnumWebServiceError.OK,
            data: await response.text()
        }
    }
    return {
        code: EnumWebServiceError.HTTP_ERROR,
        data: response.statusText
    }
}

async function login(username: string, password: string): Promise<User> {
    const challenge = await exec("tfw.login.Challenge", username);
    const h = hash(challenge, password);
    const response = await exec("tfw.login.Response", h);
    if (typeof response === 'number') {
        throw response;
    }
    gLastSuccessfulLogin.username = username;
    gLastSuccessfulLogin.password = password;
    return new User(response.login, response.name, response.roles);
}

function hash(code: number[], pwd: string): number[] {
    const output = Array(16).fill(0);
    const pass = [];

    for (let i = 0; i < pwd.length; i++) {
        pass.push(pwd.charCodeAt(i));
    }
    if (256 % pass.length == 0) {
        pass.push(0);
    }

    let j = 0;
    for (let i = 0; i < 256; i++) {
        output[i % 16] ^= i + pass[i % pass.length];
        const k1 = code[j++ % code.length] % 16;
        const k2 = code[j++ % code.length] % 16;
        const k3 = code[j++ % code.length] % 16;
        output[k3] ^= (output[k3] + 16 * k2 + k3) % 256;
        output[k2] ^= (output[k1] + output[k3]) % 256;
    }

    return output;
}
