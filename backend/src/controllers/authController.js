const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connection = require('../config/database');
const config = require('../config/config');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuário
            const [users] = await connection.query(
                'SELECT * FROM users WHERE email = ?', [email]
            );
            const user = users[0];

            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            // Verificar senha
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Senha incorreta' });
            }

            // Gerar token
            const token = jwt.sign({ id: user.id, role: user.role },
                config.jwt.secret, { expiresIn: config.jwt.expiresIn }
            );

            // Remover senha do objeto do usuário
            delete user.password;

            res.json({
                user,
                token
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async register(req, res) {
        try {
            const { name, email, password, digitalName } = req.body;

            // Verificar se usuário já existe
            const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Verifica se nome digital já existe
            const [existingNames] = await connection.query('SELECT id FROM users WHERE digital_name = ?', [digitalName]);
            if (existingNames.length > 0) {
                return res.status(400).json({ error: 'Nome digital já está em uso' });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Criar usuário
            const [result] = await connection.query(
                `INSERT INTO users (name, email, password, digital_name, role) 
                VALUES (?, ?, ?, ?, 'user')`, [name, email, hashedPassword, digitalName]
            );

            const token = jwt.sign({ id: result.insertId, role: 'user' },
                config.jwt.secret, { expiresIn: config.jwt.expiresIn }
            );

            res.status(201).json({
                user: {
                    id: result.insertId,
                    name,
                    email,
                    digitalName,
                    role: 'user'
                },
                token
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async me(req, res) {
        try {
            const [users] = await connection.query(
                'SELECT id, name, email, digital_name, role FROM users WHERE id = ?', [req.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json(users[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = authController;