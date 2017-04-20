import { Component } from '@angular/core';
import { LoadingController,AlertController } from 'ionic-angular';
import { DatePipe} from '@angular/common';


import { HttpService } from '../../providers/http-service';
import { BookService } from '../../service/BookService';
import { Dictionary } from '../../domain/Dictionary';
import { Constants } from '../../utils/Constant';
import { Book } from '../../domain/Book';

import { StorageService} from '../../service/StorageService';
import {Validators, FormBuilder,FormGroup } from '@angular/forms';
@Component({
  selector: 'page-save-bill',
  templateUrl: 'save-bill.html'
})

export class SaveBillPage{
 
  constructor(private bookService :BookService,
              private httpService :HttpService,
              public loadingCtrl: LoadingController,
              private storageService :StorageService,
              private datePipe :DatePipe,
              private formBuilder: FormBuilder,
              private alertCtrl: AlertController
              ){}
              localStorage;
  billTypes:Dictionary[];
  public defaultDate:string;
  public bookForm:FormGroup;
  ngOnInit(){
    var date = new Date();
    var str = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.defaultDate =str;
    this.init();
    this.initForm();
  }
 loader = this.httpService.loading();
  init(){
    var billtype = this.storageService.read<Dictionary[]>(Constants.billType);
    if(billtype!=null){
     this.billTypes=billtype;
    }else{
       this.loader.present();

       this.httpService.httpGetWithAuth("common/dictionary?typeid=1")
          .then(result =>{
            this.loader.dismiss();
            this.billTypes = result.object;
            this.storageService.write(Constants.billType,this.billTypes);
          })
          .catch(error =>{
            this.loader.dismiss();
            console.log(error);
          });
      
    }
		
  }

   initForm() {
        this.bookForm = this.formBuilder.group({
            id:[''],
            typeid: ['', Validators.required],
            val: ['', Validators.required],
            credate:[this.defaultDate, Validators.required] 
        });
    }
    logForm(){
        this.loader.present();
        this.bookService.saveBook(this.bookForm.value)
        .then(restEntity =>{
          this.loader.dismiss();
          if(restEntity.status==-1){
            this.showAlert('提示',restEntity.msg);
          }else{
            this.initForm();
            this.showAlert('恭喜','保存成功');
          }
        }).catch(
        error => {
          this.loader.dismiss();
          this.showAlert("保存错误",error);
        }
        )
    }
    
    showAlert(title:string,msg:string) {
      let alert = this.alertCtrl.create({
        title: title,
        subTitle: msg,
        buttons: ['确定']
      });
      alert.present();
    }
}