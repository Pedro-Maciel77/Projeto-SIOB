import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashSenha(senha: string): Promise<string> {
    return await bcrypt.hash(senha, SALT_ROUNDS);
}

export async function compararSenha(senha: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(senha, hash);
}