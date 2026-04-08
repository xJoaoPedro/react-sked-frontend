import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { PageHeader } from "../components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Building2, Calendar, Bell, CreditCard, Palette, Shield, Upload, Save, Mail, Phone, Globe, Clock, DollarSign, Check, } from "lucide-react";

export function SettingsPage() {
  // Company Profile State
  const [companyName, setCompanyName] = useState("Agendify Salão de Beleza");
  const [companyEmail, setCompanyEmail] = useState("contato@agendify.com.br");
  const [companyPhone, setCompanyPhone] = useState("(11) 98765-4321");
  const [companyWebsite, setCompanyWebsite] = useState("www.agendify.com.br");
  const [companyLogo, setCompanyLogo] = useState("");

  // Scheduling Settings
  const [appointmentInterval, setAppointmentInterval] = useState("15");
  const [minAdvanceBooking, setMinAdvanceBooking] = useState("2");
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState("30");
  const [cancellationDeadline, setCancellationDeadline] = useState("24");
  const [autoConfirm, setAutoConfirm] = useState(true);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [reminderBefore, setReminderBefore] = useState("24");
  const [notifyProfessional, setNotifyProfessional] = useState(true);
  const [notifyNewAppointment, setNotifyNewAppointment] = useState(true);
  const [notifyCancellation, setNotifyCancellation] = useState(true);

  // Financial Settings
  const [acceptCash, setAcceptCash] = useState(true);
  const [acceptDebit, setAcceptDebit] = useState(true);
  const [acceptCredit, setAcceptCredit] = useState(true);
  const [acceptPix, setAcceptPix] = useState(true);
  const [serviceFee, setServiceFee] = useState("0");
  const [currency, setCurrency] = useState("BRL");

  // Appearance Settings
  const [primaryColor, setPrimaryColor] = useState("#00A676");
  const [bookingPageUrl, setBookingPageUrl] = useState(
    "agendify.app/salon-beleza",
  );
  const [showPrices, setShowPrices] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSection = (sectionName: string) => {
    // Simular salvamento
    console.log(`Salvando seção: ${sectionName}`);
    alert(`Configurações de ${sectionName} salvas com sucesso!`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Configurações Gerais"
        subtitle="Personalize e configure seu sistema de agendamento"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-6 space-y-6">
          {/* Company Profile */}
          <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#00A676]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Perfil da Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações básicas do seu negócio
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-6 mb-6">
                {/* Logo Upload */}
                <div className="flex-shrink-0">
                  <Label htmlFor="logo-upload" className="cursor-pointer block">
                    <div className="w-32 h-32 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-[#00A676] rounded-lg">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground text-center px-2">
                            Logo da empresa
                          </span>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Company Info */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="company-name">Nome da empresa</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nome do seu negócio"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company-email"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company-phone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="company-website">Website (opcional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company-website"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                  onClick={() => handleSaveSection("Perfil da Empresa")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>

          {/* Scheduling Settings */}
          <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#00A676]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Agendamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure regras para reservas e cancelamentos
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-interval">
                    Intervalo entre atendimentos
                  </Label>
                  <Select
                    value={appointmentInterval}
                    onValueChange={setAppointmentInterval}
                  >
                    <SelectTrigger id="appointment-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-advance">Antecedência mínima</Label>
                  <Select
                    value={minAdvanceBooking}
                    onValueChange={setMinAdvanceBooking}
                  >
                    <SelectTrigger id="min-advance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-advance">Antecedência máxima</Label>
                  <Select
                    value={maxAdvanceBooking}
                    onValueChange={setMaxAdvanceBooking}
                  >
                    <SelectTrigger id="max-advance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation-deadline">
                    Prazo para cancelamento
                  </Label>
                  <Select
                    value={cancellationDeadline}
                    onValueChange={setCancellationDeadline}
                  >
                    <SelectTrigger id="cancellation-deadline">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="6">6 horas antes</SelectItem>
                      <SelectItem value="12">12 horas antes</SelectItem>
                      <SelectItem value="24">24 horas antes</SelectItem>
                      <SelectItem value="48">48 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Confirmação automática</p>
                  <p className="text-sm text-muted-foreground">
                    Agendamentos são confirmados automaticamente
                  </p>
                </div>
                <Switch
                  checked={autoConfirm}
                  onCheckedChange={setAutoConfirm}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                  onClick={() => handleSaveSection("Agendamento")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#00A676]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Notificações</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure lembretes e alertas automáticos
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#00A676]" />
                    <div>
                      <p className="font-medium">Notificações por e-mail</p>
                      <p className="text-sm text-muted-foreground">
                        Enviar lembretes por e-mail
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#00A676]" />
                    <div>
                      <p className="font-medium">Notificações por SMS</p>
                      <p className="text-sm text-muted-foreground">
                        Enviar lembretes por mensagem de texto
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="reminder-before">Enviar lembrete</Label>
                <Select
                  value={reminderBefore}
                  onValueChange={setReminderBefore}
                >
                  <SelectTrigger id="reminder-before">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="6">6 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="font-medium text-sm">Notificar sobre:</p>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A676]" />
                    <span className="text-sm">Novo agendamento</span>
                  </div>
                  <Switch
                    checked={notifyNewAppointment}
                    onCheckedChange={setNotifyNewAppointment}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A676]" />
                    <span className="text-sm">Cancelamentos</span>
                  </div>
                  <Switch
                    checked={notifyCancellation}
                    onCheckedChange={setNotifyCancellation}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A676]" />
                    <span className="text-sm">Notificar profissional</span>
                  </div>
                  <Switch
                    checked={notifyProfessional}
                    onCheckedChange={setNotifyProfessional}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                  onClick={() => handleSaveSection("Notificações")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>

          {/* Financial Settings */}
          <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#00A676]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Financeiro</h3>
                  <p className="text-sm text-muted-foreground">
                    Formas de pagamento e taxas
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-3">Formas de pagamento aceitas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-[#00A676]" />
                      <span className="font-medium">Dinheiro</span>
                    </div>
                    <Switch
                      checked={acceptCash}
                      onCheckedChange={setAcceptCash}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#00A676]" />
                      <span className="font-medium">Cartão de Débito</span>
                    </div>
                    <Switch
                      checked={acceptDebit}
                      onCheckedChange={setAcceptDebit}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#00A676]" />
                      <span className="font-medium">Cartão de Crédito</span>
                    </div>
                    <Switch
                      checked={acceptCredit}
                      onCheckedChange={setAcceptCredit}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-[#00A676]" />
                      <span className="font-medium">PIX</span>
                    </div>
                    <Switch
                      checked={acceptPix}
                      onCheckedChange={setAcceptPix}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar (US$)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-fee">
                    Taxa de serviço (%) - opcional
                  </Label>
                  <Input
                    id="service-fee"
                    type="number"
                    min="0"
                    max="100"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                  onClick={() => handleSaveSection("Financeiro")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-[#00A676]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Aparência</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize a página de agendamento pública
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor primária</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#00A676"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-url">
                  URL da página de agendamento
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="booking-url"
                    value={bookingPageUrl}
                    onChange={(e) => setBookingPageUrl(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Link público para seus clientes agendarem serviços
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Exibir preços</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar valores dos serviços na página pública
                    </p>
                  </div>
                  <Switch
                    checked={showPrices}
                    onCheckedChange={setShowPrices}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Exigir login</p>
                    <p className="text-sm text-muted-foreground">
                      Clientes precisam criar conta para agendar
                    </p>
                  </div>
                  <Switch
                    checked={requireLogin}
                    onCheckedChange={setRequireLogin}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                  onClick={() => handleSaveSection("Aparência")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#00A676]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Segurança</h3>
                  <p className="text-sm text-muted-foreground">
                    Proteja sua conta e dados
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Autenticação de dois fatores</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">
                  Tempo de sessão (minutos)
                </Label>
                <Select
                  value={sessionTimeout}
                  onValueChange={setSessionTimeout}
                >
                  <SelectTrigger id="session-timeout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tempo de inatividade antes de desconectar automaticamente
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Alterar senha</p>
                    <p className="text-sm text-amber-700 mb-3">
                      Recomendamos trocar sua senha a cada 90 dias
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      Alterar senha
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                  onClick={() => handleSaveSection("Segurança")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
