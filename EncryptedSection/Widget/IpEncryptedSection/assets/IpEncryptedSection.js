/**
 * @package ImpressPages
 *
 */
var IpWidget_IpEncryptedSection;

(function(){
    "use strict";

    IpWidget_IpEncryptedSection = function() {
        this.widgetObject = null;
        this.data         = null;
        this.password     = null; // password is only kept in memory of this instance, to make editing easier

        /**
         * Initialize an encrypted section for editing in <b>admin mode</b>.
         * (This will not be called when the section is only shown.)
         * Initially the section is always locked.
         */
        this.init = function($widgetObject, data) {
            console.log("EncryptedSection.init(this.password='"+this.password+"', data='"+data+"', encryptedText='"+data.encryptedText+"' plainText='"+data.plainText+"')");
            this.widgetObject = $widgetObject;
            this.password = null;
            data.isLocked = true;
            this.data     = data;
            $widgetObject.css("background-color", "#CFC");
            $widgetObject.find('#lockSymbol').click($.proxy(this.unlockSection, this));
        };

        /**
         * When user clickes a locked section he is asked for the password.
         * If this section is new and still empty, a new password can be set. 
         * Then the section will be unlocked and editable.
         * @param data with data.encryptedText for this section 
         */
        this.unlockSection = function() {
            console.log("unlockSection(data='"+this.data+"') this.password="+this.password);

            if (!this.password) {
                this.askForInitialPassword();  // set initial password => will delete content (if there was any)
            };
            
            // prepare a fully featured TinyMce
            var customTinyMceConfig      = ipTinyMceConfig();
            customTinyMceConfig.plugins  = customTinyMceConfig.plugins + " advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table contextmenu paste textcolor";
            customTinyMceConfig.menubar  = true;
            customTinyMceConfig.toolbar  = "insertfile undo redo | styleselect forecolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image";
            customTinyMceConfig.toolbar1 = null;
            customTinyMceConfig.toolbar2 = null;
            // when content changes, encrypt it on the client, ie. in the browser, and autosave it to our impresspages backend
            /* TOOD: no this context anymore
            customTinyMceConfig.setup = function(ed, l) { ed.on('change', $.proxy( function(e) {
                var newText = this.widgetObject.find('.ipsContent').html();
                console.log('EncryptedSection: onChange(newText="'+newText+'", password='+this.password+')');
                //var encrypted = CryptoJS.AES.encrypt(newText, this.password);
                //console.log("  encryptedText='"+encrypted+"'");
                this.widgetObject.save({encryptedText: newText});  // Only send the encrypted text to the server! And we do not reload the widget, so that the user can keep editing.
            }), this)};
            */
            
            // decrypt (except this is a newly added section)
            var encryptedText = this.widgetObject.find('.ipsContent').html();
            if (encryptedText) {
                var plainText = CryptoJS.AES.decrypt(encryptedText, this.password);
                if (!plainText) {
                    console.log("Wrong password for encryptedSection.");
                } else {
                    data.isLocked = false;          // unlock section and make it editable
                    $widgetObject.find('.ipsContent').html(plainText);
                    $widgetObject.find('.ipsContent').tinymce(customTinyMceConfig);
                }
            } else {  
                // newly added and empty section
                console.log("unlocking empty section");
                $widgetObject.find('.ipsContent').tinymce(customTinyMceConfig);
            }
            

           
        }


        /**
         * When an EncryptedSection is added for the first time, 
         * then ask for a password.
         */
        this.onAdd = function () {
            console.log("EncryptedSection.onAdd()");
            this.password = null;
            this.isLocked = true;
            //this.askForInitialPassword();   //TOOD: make it configurable via admin settings, wheter to ask for password on add
            //REMOVEME: this.widgetObject.find('.ipsContent').focus();   //TODO: remove?
        }
        
        /**
         * Ask user for an initial password of a <b>newly added</b> encrypted section.
         * The new password will be saved in the {this.password} instance variable
         * and the section's content will be cleared. There should not have been any content anyway.
         */
        this.askForInitialPassword = function() {
            
            //MAYBE: alternative implementation with ImpressPages forms http://www.impresspages.org/docs/form-example  Maybe validation would be easier
            
            var popup = $('#AskForInitialPasswordPopup');
            var confirmButton = popup.find('.ipsConfirm');
            var passwordInput = popup.find('#password');
            var passwordCheckInput = popup.find('#passwordCheck');
            
            // only enable confirm button if passwords match and contain at least one char
            passwordInput.val("");
            passwordCheckInput.val("");
            var evtData = {
                confirmButton: confirmButton, 
                pwd1: passwordInput, 
                pwd2: passwordCheckInput
            };
            passwordInput.keyup(evtData, checkPasswords);
            passwordCheckInput.keyup(evtData, checkPasswords);
            
            // set  this.password   on Confirm
            confirmButton.prop('disabled', true);
            confirmButton.off(); // ensure we will not bind second time
            confirmButton.on('click', $.proxy( function(){
                //Security check passwords again, just to make sure
                if (passwordInput.val() == passwordCheckInput.val() &&
                    passwordInput.val().length > 0) 
                { 
                    this.password = passwordInput.val();   
                    //console.log("new initial password="+this.password);   //DELETEME!!!
                    this.widgetObject.find('.ipsContent').html("");  //make encrypted section empty
                    popup.modal('hide');
                }
            }, this));
            
            // open modal popup with bootstrap
            popup.modal({
                backdrop : "static",
                keyboard : false
            }); 
            passwordInput.focus();
        };
        
        /**
         * Check if two JQuery text input fields for passwords match and contain at least 1 char.
         * If they do, then enable a confirmButton. This function is called onKeyUp of both passwords fields.
         * If any paramter is undefined or has no "value", always return false;
         * @param pwd1 JQuery text input
         * @param pwd2 JQuery text input
         */
        var checkPasswords = function(evt) {
            try {
                if (evt.data.pwd1.val().length > 0 && evt.data.pwd1.val() == evt.data.pwd2.val()) {
                    evt.data.confirmButton.prop('disabled', false);
                    if (evt.which == 13) {                    // click "Confirm" button on return key
                        evt.data.confirmButton.trigger("click");  
                    }
                    return;
                }
            } catch(e) {
                // empty catch
            }
            evt.data.confirmButton.prop('disabled', true);
        }
        
        
        /**
         * Ask user for a password in a modal popup window.
         * Make absolutely sure, that the user enters a password with at least 1 character.
         * The chosen password will be saved in the {this.password} instance variable.
         */
        this.askForPassword = function() {
            var popup = $('#AskForPasswordPopup');
            var confirmButton = popup.find('.ipsConfirm');
            var passwordInput = popup.find('#password');
            
            // only enable confirm button if password length > 1 char
            passwordInput.val("");
            passwordInput.on('keyup', function(evt){
                if (this.value && this.value.length > 0) {
                  confirmButton.prop('disabled', false);
                  if (evt.which == 13) {
                      confirmButton.trigger("click");  // click "Confirm" button on return
                  }
                } else {
                  confirmButton.prop('disabled', true);
                }
            });
            
            // set  this.password   on Confirm
            confirmButton.prop('disabled', true);
            confirmButton.off(); // ensure we will not bind second time
            confirmButton.on('click', $.proxy( function(){
                if (passwordInput.val() && passwordInput.val().length > 0) {
                    this.password = passwordInput.val();   
                    console.log("got password="+this.password);   //FIXME
                    this.unlockSection(); 
                    popup.modal('hide');    
                }
            }, this));
            
            // open modal popup with bootstrap
            popup.modal({
                "backdrop" : "static",
                "keyboard" : "false"
            }); 
            passwordInput.focus();
        };
        
    };

})();


