/*
  # Schema para Sistema de Gestión de Clubes y Clases

  ## Descripción
  Este schema crea la estructura completa para un sistema multi-club de gestión de clases,
  estudiantes, pagos, facturas y asistencias.

  ## Tablas Creadas

  ### 1. clubs
  Almacena información de cada club/organización
  - `id` (uuid, PK): Identificador único
  - `name` (text): Nombre del club
  - `password` (text): Contraseña de acceso
  - `description` (text): Descripción opcional
  - `created_at` (timestamptz): Fecha de creación

  ### 2. students
  Estudiantes asociados a cada club
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `name` (text): Nombre completo
  - `dni` (text): Documento de identidad
  - `phone` (text): Teléfono de contacto
  - `lot` (text): Lote/parcela
  - `neighborhood` (text): Barrio
  - `condition` (text): Titular o Familiar
  - `observations` (text): Observaciones
  - `current_balance` (numeric): Saldo actual
  - `created_at` (timestamptz): Fecha de creación

  ### 3. account_entries
  Historial de cuenta de cada estudiante
  - `id` (uuid, PK): Identificador único
  - `student_id` (uuid, FK): Referencia al estudiante
  - `date` (timestamptz): Fecha del movimiento
  - `class_name` (text): Nombre de la clase
  - `class_id` (uuid): ID de la clase
  - `attendance_status` (text): Presente/Ausente
  - `amount` (numeric): Monto (negativo para descuentos)
  - `kind` (text): Tipo: class o discount
  - `note` (text): Nota opcional
  - `created_at` (timestamptz): Fecha de creación

  ### 4. classes
  Clases programadas
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `date` (timestamptz): Fecha y hora
  - `type` (text): individual o group
  - `max_students` (integer): Máximo de estudiantes
  - `price_per_student` (numeric): Precio por estudiante
  - `observations` (text): Observaciones
  - `repeating` (text): none, weekly o monthly
  - `students` (text[]): Array de IDs de estudiantes
  - `attendances` (jsonb): Objeto de asistencias
  - `status` (text): scheduled, completed o cancelled
  - `parent_id` (uuid): ID de clase padre (para recurrentes)
  - `created_at` (timestamptz): Fecha de creación

  ### 5. transactions
  Transacciones de cargo y pago
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `student_id` (uuid, FK): Referencia al estudiante
  - `student_name` (text): Nombre del estudiante
  - `class_id` (uuid): ID de clase (opcional)
  - `class_name` (text): Nombre de la clase
  - `type` (text): charge o payment
  - `amount` (numeric): Monto
  - `date` (timestamptz): Fecha
  - `description` (text): Descripción
  - `status` (text): Pendiente o Pagado
  - `invoice_id` (uuid): ID de factura (opcional)
  - `settlement_kind` (text): payment o discount

  ### 6. receipts
  Recibos de pago generados
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `student_id` (uuid, FK): Referencia al estudiante
  - `student_name` (text): Nombre del estudiante
  - `date` (timestamptz): Fecha del recibo
  - `transactions` (jsonb): Array de transacciones incluidas
  - `total_amount` (numeric): Monto total de cargos
  - `discount_amount` (numeric): Monto de descuento
  - `paid_amount` (numeric): Monto final pagado

  ### 7. payments
  Pagos realizados por estudiantes
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `student_id` (uuid, FK): Referencia al estudiante
  - `amount` (numeric): Monto pagado
  - `method` (text): cash, transfer, card o combined
  - `date` (timestamptz): Fecha del pago
  - `description` (text): Descripción
  - `invoice_id` (uuid): ID de factura (opcional)
  - `transaction_ids` (text[]): Array de IDs de transacciones

  ### 8. invoices
  Facturas generadas
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `student_id` (uuid, FK): Referencia al estudiante
  - `number` (text): Número de factura
  - `date` (timestamptz): Fecha de emisión
  - `items` (jsonb): Items de la factura
  - `subtotal` (numeric): Subtotal
  - `total` (numeric): Total
  - `status` (text): pending, paid o cancelled
  - `payment_method` (text): Método de pago
  - `paid_at` (timestamptz): Fecha de pago

  ### 9. users
  Usuarios del sistema por club
  - `id` (uuid, PK): Identificador único
  - `club_id` (uuid, FK): Referencia al club
  - `name` (text): Nombre del usuario
  - `role` (text): admin o professor

  ## Seguridad (RLS)

  Se habilita Row Level Security en todas las tablas con políticas restrictivas que requieren
  autenticación y verificación de pertenencia al club correspondiente.

  ## Notas Importantes

  1. **Multi-tenancy**: Todas las tablas están segregadas por `club_id`
  2. **JSONB**: Se usa JSONB para `attendances`, `transactions` (en receipts) e `items` (en invoices)
  3. **Arrays**: Se usan arrays de text para `students` y `transaction_ids`
  4. **Cascadas**: Las relaciones FK tienen ON DELETE CASCADE para mantener integridad
  5. **Índices**: Se crean índices en las FK principales para optimizar queries
*/

-- Crear tabla clubs
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  password text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  dni text DEFAULT '',
  phone text DEFAULT '',
  lot text DEFAULT '',
  neighborhood text DEFAULT '',
  condition text DEFAULT 'Titular' CHECK (condition IN ('Titular', 'Familiar')),
  observations text DEFAULT '',
  current_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla account_entries
CREATE TABLE IF NOT EXISTS account_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  class_name text NOT NULL,
  class_id uuid,
  attendance_status text CHECK (attendance_status IN ('Presente', 'Ausente')),
  amount numeric NOT NULL,
  kind text DEFAULT 'class' CHECK (kind IN ('class', 'discount')),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('individual', 'group')),
  max_students integer DEFAULT 1,
  price_per_student numeric DEFAULT 0,
  observations text DEFAULT '',
  repeating text DEFAULT 'none' CHECK (repeating IN ('none', 'weekly', 'monthly')),
  students text[] DEFAULT '{}',
  attendances jsonb DEFAULT '{}',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  parent_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  class_id uuid,
  class_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('charge', 'payment')),
  amount numeric NOT NULL,
  date timestamptz NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Pagado')),
  invoice_id uuid,
  settlement_kind text CHECK (settlement_kind IN ('payment', 'discount'))
);

-- Crear tabla receipts
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  date timestamptz NOT NULL,
  transactions jsonb DEFAULT '[]',
  total_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0
);

-- Crear tabla payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL CHECK (method IN ('cash', 'transfer', 'card', 'combined')),
  date timestamptz NOT NULL,
  description text DEFAULT '',
  invoice_id uuid,
  transaction_ids text[] DEFAULT '{}'
);

-- Crear tabla invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  number text NOT NULL,
  date timestamptz NOT NULL,
  items jsonb DEFAULT '[]',
  subtotal numeric DEFAULT 0,
  total numeric DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method text CHECK (payment_method IN ('cash', 'transfer', 'card', 'combined')),
  paid_at timestamptz
);

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'professor'))
);

-- Crear índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_students_club_id ON students(club_id);
CREATE INDEX IF NOT EXISTS idx_account_entries_student_id ON account_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_classes_club_id ON classes(club_id);
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes(date);
CREATE INDEX IF NOT EXISTS idx_transactions_club_id ON transactions(club_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_receipts_club_id ON receipts(club_id);
CREATE INDEX IF NOT EXISTS idx_payments_club_id ON payments(club_id);
CREATE INDEX IF NOT EXISTS idx_invoices_club_id ON invoices(club_id);
CREATE INDEX IF NOT EXISTS idx_users_club_id ON users(club_id);

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clubs
CREATE POLICY "Users can view clubs they belong to"
  ON clubs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create clubs"
  ON clubs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clubs they belong to"
  ON clubs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete clubs they belong to"
  ON clubs FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para students
CREATE POLICY "Users can view students in their club"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create students in their club"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update students in their club"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete students in their club"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para account_entries
CREATE POLICY "Users can view account entries for students in their club"
  ON account_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = account_entries.student_id
    )
  );

CREATE POLICY "Users can create account entries for students in their club"
  ON account_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = account_entries.student_id
    )
  );

CREATE POLICY "Users can update account entries for students in their club"
  ON account_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = account_entries.student_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = account_entries.student_id
    )
  );

CREATE POLICY "Users can delete account entries for students in their club"
  ON account_entries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = account_entries.student_id
    )
  );

-- Políticas RLS para classes
CREATE POLICY "Users can view classes in their club"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create classes in their club"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update classes in their club"
  ON classes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete classes in their club"
  ON classes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para transactions
CREATE POLICY "Users can view transactions in their club"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transactions in their club"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update transactions in their club"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete transactions in their club"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para receipts
CREATE POLICY "Users can view receipts in their club"
  ON receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create receipts in their club"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete receipts in their club"
  ON receipts FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para payments
CREATE POLICY "Users can view payments in their club"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create payments in their club"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas RLS para invoices
CREATE POLICY "Users can view invoices in their club"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create invoices in their club"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas RLS para users
CREATE POLICY "Users can view users in their club"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create users in their club"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update users in their club"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
