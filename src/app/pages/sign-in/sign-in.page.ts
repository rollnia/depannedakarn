import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';

import { AppPostService } from "../../shared/services/app-post.service";
import { AppGetService } from "../../shared/services/app-get.service";
import { LoadingController, AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage {
  public loginForm: FormGroup;
  public isSubmitted: boolean = false;
  public subscriptions: Subscription[] = [];
  loading: any;
  return: string = '';

  constructor(private platform: Platform, public formBuilder: FormBuilder, private alertCtrl: AlertController, private appGetService: AppGetService, private appPostService: AppPostService, private route: ActivatedRoute, private router: Router, public loadingController: LoadingController) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/home']);
    });
  }

  ionViewWillEnter() {
    this.route.queryParams.subscribe(params => {
      this.return = params && params.return ? JSON.parse(params.return) : '';
    });
    localStorage.removeItem('currentUserData');
    this.createLoginForm();
  }

  ionViewDidLeave() {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }

  private createLoginForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  private getUserType() {
    const subs = this.appGetService.userType().subscribe(res => {
      if (res?.user_type) {
        this.loading.dismiss();
        const user = JSON.parse(localStorage.getItem('currentUserData'));
        user['user_type'] = res['user_type'];
        localStorage.setItem('currentUserData', JSON.stringify(user));
        //if user book a service without login and then navigate to login and after login navigate to paymnt page
        if (this.return) {
          this.router.navigate([this.return[0]], {
            queryParams: {
              return: this.return[1]
            }
          });
          return;
        }
        if (res['user_type'] === 'client') {
          this.router.navigate(['/user-dashboard']);
        } else {
          this.router.navigate(['/service-providor-dashboard']);
        }
      }
    }, error => {
      this.loading.dismiss();
      console.error(error);
    });
    this.subscriptions.push(subs);
  }

  get errorControl() {
    return this.loginForm.controls;
  }
  /**
   * Method to login user 
   * @param formData : Login form controls
   */
  public async login(formData) {
    this.loading = await this.loadingController.create({
      message: 'Loading please wait',
    });

    if (this.loginForm.invalid) {
      this.isSubmitted = true;
      return;
    }
    const reqObj = {
      username: formData['controls']['username'].value,
      password: formData['controls']['password'].value,
    };

    this.loading.present();
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: '',
      message: 'Unauthorized access',
      buttons: ['OK']
    });
    const subs = this.appPostService.loginUser(reqObj).subscribe(res => {

      if (res?.access_token) {
        const userData = {
          token: res['access_token']
        };
        localStorage.setItem('currentUserData', JSON.stringify(userData));
        this.createLoginForm();
        this.getUserType();
      } else if (res?.message && res.message === 'Unauthorized') {
        this.loading.dismiss();
      }
    }, error => {
      this.loading.dismiss();
      if (error?.statusText && error.statusText === 'Unauthorized') {
        alert.present();
      }
      console.error(error);
    });
    this.subscriptions.push(subs);
  }

  public goToRegistration() {
    this.router.navigate(['/sign-up']);
  }
}
