import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service'; // Asegúrate de apuntar bien a tu servicio
import { of } from 'rxjs';

describe('LoginComponent - Proyecto Nebula', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // 1. Creamos un "clon simulado" de tu servicio de autenticación
    const spy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [ LoginComponent, ReactiveFormsModule ], // Si usas componentes standalone
      providers: [
        { provide: AuthService, useValue: spy } // Reemplazamos el servicio real por el simulado
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Esto inicializa el formulario en el componente
  });

  // PRUEBA 1: Verificar que el formulario empiece vacío y bloqueado
  it('debería arrancar con el formulario de login inválido', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  // PRUEBA 2: Verificar que detecte correos mal escritos
  it('debería marcar error si el email no es válido', () => {
    const emailControl = component.loginForm.get('email'); // Ajusta 'email' al nombre de tu input
    emailControl?.setValue('correoGamerErroneo');
    expect(emailControl?.hasError('email')).toBeTrue();
  });

  // PRUEBA 3: Verificar que el login se ejecute al poner datos correctos
  it('debería llamar al servicio de Auth al enviar datos válidos', () => {
    // Simulamos que el backend de Railway nos devuelve un Ok exitoso
    authServiceSpy.login.and.returnValue(of({ token: 'fake-jwt-token' }));

    component.loginForm.get('email')?.setValue('test@nebula.com');
    component.loginForm.get('password')?.setValue('GamerPassword123!');
    
    component.onSubmit(); // Llama a la función que dispara tu formulario

    expect(authServiceSpy.login).toHaveBeenCalled(); // El test pasa si se intentó loguear
  });
});