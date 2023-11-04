# react-bootstrap-test/react-simply

Demo different 2 forms, one controlled and one uncontrolled.

I'm using Bootstrap here, so I will use the react-bootstrap "Form" and "Button" controls.

I use a simple tabbed interface, but I am using routing, too.
## State lifting

A function is passed from the app to the form,
so that the form can update the app with "firstName";
so state is "lifted" from the form to the parent.

I am not using Redux in this example to save state, 
so go to the Controlled Form tab and enter something.

Go to another tab.

Go back to Controlled Form.

Note that it's empty.

I will address this in react-redux-template
