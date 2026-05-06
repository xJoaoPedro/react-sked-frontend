import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { PageHeader } from "../components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Building2, Calendar, Bell, CreditCard, Palette, Shield, Upload, Save, Mail, Phone, Globe, Clock, DollarSign, Check, MessageCircle, HelpCircle, Copy, Lock, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, } from "@/components/ui/input-group";
import { LoadingPage } from "./LoadingPage";
import { useOutletContext } from "react-router-dom";
import { formatPhone } from "@/lib/parsers";
import { api } from "@/lib/api";
import { toast } from "sonner";


export function SettingsPage() {
  const { dados, updateDados } = useOutletContext();
  const [data, setDataState] = useState(null);

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.settings);
  }, [dados])

  const   handlePhoneChange = (value: string) => {
    const cleanedPhone = value.replace(/\D/g, "").slice(0, 11);

    setDataState((prev) => ({ ...prev, phone: cleanedPhone }));
  };

  const handleSaveData = async () => {
    await api.patch(`/companies/${localStorage.getItem('companyId')}`, data)
    const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/settings`)).data.data
    
    toast.success('Dados da empresa alterados com sucesso!')
    setDataState(response)
    updateDados((prev) => ({
      ...prev,
      settings: response,
    }));
  }

  if (data === null) return <LoadingPage />

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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
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
                    <div className="w-32 h-32 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-primary rounded-lg">
                      {data.photo ? (
                        <img
                          src={data.photo}
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
                    // onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Company Info */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="company-name">Nome da empresa</Label>
                    <Input
                      id="company-name"
                      value={data.fantasy_name}
                      onChange={(e) =>
                        setDataState((prev) => ({ ...prev, fantasy_name: e.target.value }))
                      }
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
                        value={data.email}
                        onChange={(e) =>
                          setDataState((prev) => ({ ...prev, email: e.target.value }))
                        }
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
                        type="tel"
                        inputMode="numeric"
                        maxLength={15}
                        placeholder="(11) 99999-9999"
                        value={formatPhone(data.phone ?? "")}
                        onChange={(e) => handlePhoneChange(e.target.value)}
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
                        value={data.website}
                        onChange={(e) =>
                          setDataState((prev) => ({ ...prev, website: e.target.value }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleSaveData("Perfil da Empresa")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>

          {/* Financial Settings */}
          {/* <Card className="gap-0">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
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
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium">Dinheiro</span>
                    </div>
                    <Switch
                      checked={acceptCash}
                      onCheckedChange={setAcceptCash}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">Cartão de Débito</span>
                    </div>
                    <Switch
                      checked={acceptDebit}
                      onCheckedChange={setAcceptDebit}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">Cartão de Crédito</span>
                    </div>
                    <Switch
                      checked={acceptCredit}
                      onCheckedChange={setAcceptCredit}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium">PIX</span>
                    </div>
                    <Switch
                      checked={acceptPix}
                      onCheckedChange={setAcceptPix}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleSaveSection("Financeiro")}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
